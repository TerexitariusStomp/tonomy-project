// User service to manage Tonomy users in your database
export interface TonomyUserRecord {
  id: string;
  tonomyUsername: string;
  did: string;
  email?: string;
  kycVerified: boolean;
  kycVerifiedAt?: Date;
  lastLogin: Date;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export class UserService {
  async upsertUser(data: {
    username: string;
    did: string;
    email?: string;
    kycVerified?: boolean;
  }): Promise<TonomyUserRecord> {
    const existingUser = await this.findByUsername(data.username);

    if (existingUser) {
      return await this.updateUser(existingUser.id, {
        lastLogin: new Date(),
        kycVerified: data.kycVerified ?? existingUser.kycVerified,
      });
    }

    return await this.createUser({
      tonomyUsername: data.username,
      did: data.did,
      email: data.email,
      kycVerified: data.kycVerified ?? false,
      lastLogin: new Date(),
    });
  }

  async findByUsername(username: string): Promise<TonomyUserRecord | null> {
    throw new Error('Not implemented - provide database query');
  }

  async findByDid(did: string): Promise<TonomyUserRecord | null> {
    throw new Error('Not implemented - provide database query');
  }

  async createUser(data: any): Promise<TonomyUserRecord> {
    throw new Error('Not implemented - provide database insert');
  }

  async updateUser(userId: string, data: Partial<TonomyUserRecord>): Promise<TonomyUserRecord> {
    throw new Error('Not implemented - provide database update');
  }

  async recordKycVerification(
    username: string,
    credentialId: string,
    verified: boolean
  ): Promise<void> {
    throw new Error('Not implemented - provide database insert');
  }
}

export default new UserService();
