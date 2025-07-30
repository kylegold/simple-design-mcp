import crypto from 'crypto';

/**
 * Manages workflow sessions for Commands.com compatible streaming responses
 * Stores workflow state and allows step-by-step execution
 */
export class WorkflowSessionManager {
  constructor(orchestrator) {
    this.orchestrator = orchestrator;
    this.sessions = new Map();
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
    
    // Clean up expired sessions every 5 minutes
    setInterval(() => this.cleanExpiredSessions(), 5 * 60 * 1000);
  }

  /**
   * Generate a unique session ID
   */
  generateId() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Create a new workflow session
   */
  createSession(task, input) {
    const sessionId = this.generateId();
    const orchestrationResult = this.orchestrator.orchestrate(task, input);
    
    this.sessions.set(sessionId, {
      id: sessionId,
      workflow: orchestrationResult.workflow,
      orchestrationResult,
      task,
      input,
      currentStep: 0,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      status: 'active',
      context: orchestrationResult.context || {
        projectName: input.projectName || 'app',
        appType: 'general'
      }
    });
    
    return sessionId;
  }

  /**
   * Get a session by ID
   */
  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    // Update last accessed time
    session.lastAccessed = Date.now();
    
    // Check if session is expired
    if (this.isSessionExpired(session)) {
      this.sessions.delete(sessionId);
      return null;
    }
    
    return session;
  }

  /**
   * Update session state
   */
  updateSession(sessionId, updates) {
    const session = this.getSession(sessionId);
    if (!session) return null;
    
    Object.assign(session, updates);
    session.lastAccessed = Date.now();
    
    return session;
  }

  /**
   * Mark session as completed
   */
  completeSession(sessionId) {
    const session = this.getSession(sessionId);
    if (!session) return;
    
    session.status = 'completed';
    session.completedAt = Date.now();
  }

  /**
   * Check if a session is expired
   */
  isSessionExpired(session) {
    return Date.now() - session.lastAccessed > this.sessionTimeout;
  }

  /**
   * Clean up expired sessions
   */
  cleanExpiredSessions() {
    for (const [sessionId, session] of this.sessions.entries()) {
      if (this.isSessionExpired(session)) {
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * Get session statistics
   */
  getStats() {
    const stats = {
      total: this.sessions.size,
      active: 0,
      completed: 0,
      expired: 0
    };
    
    for (const session of this.sessions.values()) {
      if (this.isSessionExpired(session)) {
        stats.expired++;
      } else if (session.status === 'completed') {
        stats.completed++;
      } else {
        stats.active++;
      }
    }
    
    return stats;
  }
}