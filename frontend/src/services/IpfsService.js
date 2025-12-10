import { PinataSDK } from "pinata";

class IpfsService {
  constructor() {
    this.pinata = new PinataSDK({
      pinataJwt: import.meta.env.VITE_PINATA_JWT,
      pinataGateway: import.meta.env.VITE_GATEWAY_URL,
    });
    

    this.initialized = this.initializeGroups();
  }

  async initializeGroups() {
    try {
      this.Degree_File = await this.ensureGroupExists("CertChain_Degree_File");
      this.Degree_Metadata = await this.ensureGroupExists("CertChain_Degree_Metadata");
    } catch (error) {
      console.error("Error initializing groups:", error);
    }
  }

  async ensureGroupExists(groupName) {
    try {
      const result = await this.pinata.groups.public.list().name(groupName);
      console.log("Groups found:", result);

      if (result.groups && result.groups.length > 0) {
        return result.groups[0];
      } else {
        console.error(`Group ${groupName} not found.`);
        throw new Error(`Group ${groupName} does not exist`);
      }
    } catch (error) {
      console.error(`Error ensuring group ${groupName} exists:`, error);
      throw error;
    }
  }

  async uploadDegreeFile(file) {
    try {
      if (!(file instanceof File)) {
        throw new Error("Invalid file input");
      }

      // Check if the file format is PDF
      if (file.type !== "application/pdf") {
        throw new Error("Only PDF file format is supported");
      }

      const upload = ((await this.pinata.upload.public
        .file(file)
        .name(`DegreeFile-${Date.now()}`)
        .group(this.Degree_File.id)));

      return {
        cid: upload.cid,
        url: `https://${import.meta.env.VITE_GATEWAY_URL}/ipfs/${upload.cid}`,
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error(`Unable to upload file: ${error.message}`);
    }
  }

  async uploadDegreeMetadata(metadata) {
    console.log("Metadata:", metadata);
    try {
      if (!metadata || typeof metadata !== "object") {
        throw new Error("Invalid metadata");
      }

      const upload = await this.pinata.upload.public
        .json(metadata)
        .name(`DegreeMetadata-${Date.now()}`)
        .group(this.Degree_Metadata.id);

      return {
        cid: upload.cid,
        url: `https://${import.meta.env.VITE_GATEWAY_URL}/ipfs/${upload.cid}`,
      };
    } catch (error) {
      console.error("Error uploading metadata:", error);
      throw new Error(`Unable to upload metadata: ${error.message}`);
    }
  }
}

export default new IpfsService();
