import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";

export const savePdfToFile = async (htmlContent, fileName, folderName) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });

    const outputDir = path.join(process.cwd(), "public", folderName);
    await fs.mkdir(outputDir, { recursive: true });
    const filePath = path.join(outputDir, fileName);
    await fs.writeFile(filePath, pdfBuffer);

    console.log(`PDF successfully generated: ${fileName}`);
    return fileName;
  } catch (error) {
    console.error("Error generating or saving PDF:", error);
    throw new Error("Failed to create and save the customer PDF.");
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};