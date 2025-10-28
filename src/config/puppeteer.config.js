import puppeteer from "puppeteer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import "dotenv/config";

import s3Client from "./aws.config.js";

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

    const bucketName = process.env.S3_BUCKET_NAME;
    const s3Key = `${folderName}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: pdfBuffer,
      ContentType: "application/pdf",
    });

    await s3Client.send(command);

    console.log(`PDF successfully generated and uploaded to S3: ${s3Key}`);

    const s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    return {
      key: s3Key,
      url: s3Url,
    };
  } catch (error) {
    console.error("Error generating or uploading PDF to S3:", error);
    throw new Error("Failed to create and upload the PDF.");
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
