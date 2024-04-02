import db from '@/lib/db/db';

class Logger {
  static async createError(request, severity, response) {
    const userId = request.auth.credentials === null ? null : request.auth.credentials.id;
    await db.none(`INSERT INTO app_logs(user_id, severity, log_message, log_details) VALUES(${userId}, '${severity}','${response.message}', '${JSON.stringify(response)}')`);
  }
}

export default Logger;
