import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { createReport } from "docx-templates";

// ES Modules boilerplate
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateDocument() {
  try {
    console.log("Starting document generation...");

    // --- 1. DEFINE FILE PATHS ---
    const templateFilePath = path.join(__dirname, "../../public", "workorder-temp.docx");
    const imageFilePath = path.join(__dirname, "../../public", "southLogo.png");
    const outputFilePath = path.join(__dirname, "output.docx");

    console.log("Template file path:", templateFilePath);
    console.log("Image file path:", imageFilePath);
    console.log("Output file path:", outputFilePath);

    // --- 2. READ FILES ---
    console.log("Reading template and image files...");
    const templateFile = await fs.readFile(templateFilePath);
    const imageBuffer = await fs.readFile(imageFilePath);

    console.log("Template file size:", templateFile.length);
    console.log("Image buffer length:", imageBuffer.length);

    // Save imageBuffer to a file to verify its validity
    console.log("Saving image buffer to test_image_output.png for verification...");
    await fs.writeFile(path.join(__dirname, "test_image_output.png"), imageBuffer);

    // --- 3. PREPARE DATA ---
    const base64Image = imageBuffer.toString("base64");
    const data = {
      signature: {
        data: base64Image,
        extension: "png",
        width: 305, // In pixels, matching original
        height: 65, // In pixels, matching original
      },
    };

    console.log("Data prepared. Processing template...");

    // --- 4. PROCESS THE TEMPLATE ---
    let generatedDoc;
    try {
      generatedDoc = await createReport({
        template: templateFile,
        data: data,
      });
      console.log("Template processed successfully, generated document size:", generatedDoc.length);
    } catch (error) {
      console.error("Error during template processing:", error);
      throw error;
    }

    // --- 5. SAVE THE FINAL DOCUMENT ---
    await fs.writeFile(outputFilePath, generatedDoc);

    console.log("----------------------------------------------------");
    console.log("✅ Success! Document generated.");
    console.log(`✅ File saved to: ${outputFilePath}`);
    console.log("----------------------------------------------------");
  } catch (error) {
    console.error("❌ An error occurred while generating the document:");
    console.error(error);
  }
}

generateDocument();