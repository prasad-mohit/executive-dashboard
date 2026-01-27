const MCP_BASE_URL = 'http://localhost:3001/api/mcp';

class MCPConnectorService {
  async fetchData(endpoint) {
    try {
      const response = await fetch(`${MCP_BASE_URL}/${endpoint}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return null;
    }
  }

  async getERPData() {
    return this.fetchData('erp');
  }

  async getCRMData() {
    return this.fetchData('crm');
  }

  async getEmailData() {
    return this.fetchData('email');
  }

  async getHRData() {
    return this.fetchData('hr');
  }

  async getMarketData() {
    return this.fetchData('market');
  }

  async getNewsData() {
    return this.fetchData('news');
  }

  async getAggregateData() {
    return this.fetchData('aggregate');
  }

  async getHealthStatus() {
    return this.fetchData('health');
  }

  async sendAgentMessage(from, to, message, data) {
    try {
      const response = await fetch(`${MCP_BASE_URL}/agent/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from, to, message, data })
      });
      return await response.json();
    } catch (error) {
      console.error('Error sending agent message:', error);
      return null;
    }
  }
}

export default new MCPConnectorService();
