class ApiResponse {
    constructor(res, statusCode = 200, data = null, message = '', meta = null) {
      this.res = res;
      this.statusCode = statusCode;
      this.data = data;
      this.message = message;
      this.meta = meta;
      
      this.send();
    }
  
    send() {
      const response = {
        success: this.statusCode >= 200 && this.statusCode < 300,
        message: this.message || '',
        data: this.data || null,
      };
  
      if (this.meta) {
        response.meta = this.meta;
      }
  
      this.res.status(this.statusCode).json(response);
    }
  
    static success(res, data = null, message = 'Success', statusCode = 200, meta = null) {
      return new ApiResponse(res, statusCode, data, message, meta);
    }
  
    static created(res, data = null, message = 'Resource created') {
      return new ApiResponse(res, 201, data, message);
    }
  
    static noContent(res, message = 'No content') {
      return new ApiResponse(res, 204, null, message);
    }
  }
  
  module.exports = ApiResponse;