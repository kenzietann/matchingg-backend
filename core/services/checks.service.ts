import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';

export async function extract(userCV: Buffer, fileType: string): Promise<string> {
  if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer: userCV });
    return result.value;
  } else {
    
    const { data: { text } } = await Tesseract.recognize(userCV, 'jpn+eng');
    return text;
  }
}