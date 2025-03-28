declare module 'pdf-to-text' {
  interface PdfToTextOptions {
    from?: number;
    to?: number;
  }

  interface PdfUtil {
    pdfToText(
      pdfPath: string,
      options: PdfToTextOptions,
      callback: (error: Error | null, data: string) => void
    ): void;
    pdfToText(
      pdfPath: string,
      callback: (error: Error | null, data: string) => void
    ): void;
  }

  const pdfUtil: PdfUtil;
  export = pdfUtil;
} 