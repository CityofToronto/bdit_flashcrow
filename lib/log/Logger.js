import db from '@/lib/db/db';

class Logger {
  static async createError(request, severity, error) {
    const userId = request.auth.credentials === null ? null : request.auth.credentials.id;
    try {
      await db.none(`INSERT INTO app_logs(user_id, severity, log_message, log_details) VALUES(${userId}, '${severity}','${error.message}', '${JSON.stringify(error)}')`);
    } catch (err) {
      request.log(err);
    }
    return true;
  }
}

export default Logger;
