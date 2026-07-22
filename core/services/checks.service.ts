import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import Anthropic from "@anthropic-ai/sdk";
import { AppError } from '../errors/error.handler.js';  
import { FastifyInstance } from 'fastify';
import { ResultsEntity } from '../entities/results.entity.js';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function extract(userCV: Buffer, fileType: string): Promise<string> {
  if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer: userCV });
    return result.value;
  } else {
    
    const { data: { text } } = await Tesseract.recognize(userCV, 'jpn+eng');
    return text;
  }
}

export async function compatibilityScore(cvText: string, jdText: string){

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [
      { role: 'user', content: `
              You are a senior career advisor and technical recruiter with 10+ years of experience. A candidate has come to you for consultation — they have shared their CV and a job description they are targeting. Speak directly to them as their advisor. Use "you" when referring to the candidate and "this company" or the company name when referring to the employer.

              Your task is to score how well the candidate's CV matches the job description. The CV text may contain OCR noise (misread characters, spacing errors, garbled symbols) — use context to interpret it as accurately as possible.
              IMPORTANT!!: Your entire response — all strings inside the JSON — must be written in the same language as the job description. If the job description is in Japanese, respond entirely in Japanese. If in English, respond in English.
                           Detect the dominant language of the job description and respond entirely in that language. If the job description is predominantly Japanese, respond in Japanese. If predominantly English, respond in English.
              Analyze the following:

              CV:
              ${cvText}

              Job Description:
              ${jdText}

              
              Evaluate across these 5 dimensions (score each 0-100):
              - skills_match: How many required technical skills the candidate has
              - experience_level: Years and seniority vs what the role demands
              - keyword_alignment: How well CV terminology matches JD language
              - culture_tone_fit: Whether the CV tone and values align with the company culture described
              - language_clarity: How clearly and professionally the CV is written (account for OCR noise — do not penalize for it)
              
              Overall score guide:
              - 90-100: Near-perfect match
              - 70-89: Strong match, minor gaps
              - 50-69: Partial match, key gaps present
              - Below 50: Significant mismatch

              When scoring, weigh requirements by how the JD frames them:
              - "Required" or "必須" → penalize heavily if missing
              - "Preferred" or "歓迎" → penalize lightly if missing
              - "No experience needed", "未経験歓迎", or "career changers welcome" → do not penalize for lack of industry experience; focus instead on transferable skills and attitude signals

              label must be one of: "Excellent match", "Strong match", "Partial match", "Weak match"
              percentile = estimated top X% of applicants this candidate would beat (integer)

              Return ONLY a valid JSON object, no text outside the JSON:
              {
                "score": <integer 0-100>,
                "label": "<match label>",
                "percentile": <integer>,
                "jobTitle": "<job title extracted from the job description, otherwise null>"
                "companyName": "<company name if mentioned in the job description, otherwise null>"
                "breakdown": {
                  "skills_match": <integer 0-100>,
                  "experience_level": <integer 0-100>,
                  "keyword_alignment": <integer 0-100>,
                  "culture_tone_fit": <integer 0-100>,
                  "language_clarity": <integer 0-100>
                },
                "strengths": ["<specific strength>", "..."],
                "gaps": ["<specific gap>", "..."],
                "recommendation": "<maximum 10 sentences of specific actionable advice written directly to the candidate using 'you', not 'the candidate'>"
              }
        ` }
    ]
  });

  const block = response.content[0];
  if (block.type !== 'text') throw new AppError('Unexpected Response type', 500, 'unexpected_response');
  const raw = block.text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

  try {
    return JSON.parse(raw);
  } catch {
    throw new AppError('AI response was invalid, please try again', 502, 'ai_response_invalid');
  }
}

export async function saveCachedResult(fastify: FastifyInstance, uuid: string, cacheKey: string){
  const cached = await fastify.redis.get(`check:${cacheKey}`);
  if(!cached) throw new AppError('Result not found or expired', 404, 'result_not_found');
  const result = JSON.parse(cached);

  const resultsRepository = fastify.orm.getRepository(ResultsEntity);

  const data = resultsRepository.create({
    uuid,
    jobTitle: result.jobTitle,
    companyName: result.companyName,
    score: result.score,
    label: result.label,
    percentile: result.percentile,
    breakdown: result.breakdown,
    strengths: result.strengths,
    gaps: result.gaps,
    recommendation: result.recommendation,
    cacheKey: cacheKey,
  });

  return await resultsRepository.save(data);
}