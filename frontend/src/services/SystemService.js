import axios from "axios";

const API_BASE_URL = "/api";

class SystemService {
    /**
     * Fetch list of snapshots from backend
     */
    async getSnapshots() {
        try {
            const response = await axios.get(`${API_BASE_URL}/system/snapshots`);
            return response.data.data;
        } catch (error) {
            console.error("Error fetching snapshots:", error);
            throw error;
        }
    }

    /**
     * Trigger restore on backend
     * @param {string} ipfsCid 
     */
    async restoreSnapshot(ipfsCid) {
        try {
            const response = await axios.post(`${API_BASE_URL}/system/restore`, { ipfsCid });
            return response.data.data;
        } catch (error) {
            console.error("Error restoring snapshot:", error);
            throw error;
        }
    }
}

export default new SystemService();
