const kv = await Deno.openKv();

export class DenoKvUserStore {
  private userEmailPrefix = ["users", "email"];
  private userIdPrefix = ["users", "id"];
  
  async findUserByEmail(email: string) {
    const emailKey = [...this.userEmailPrefix, email];
    const userEntry = await kv.get(emailKey);
    
    if (!userEntry.value) { return null };
    return userEntry.value;
  }
  
  async createUser(userData: { email: string; username?: string }) {
    try {
      const userId = crypto.randomUUID();
      const authId = userId;
      
      const user = {
        id: userId,
        authId: authId,
        email: userData.email,
        username: userData.username || null,
        createdAt: new Date().toISOString(),
      };
      
      const idKey = [...this.userIdPrefix, userId];
      const emailKey = [...this.userEmailPrefix, userData.email];
      
      const result = await kv.atomic()
        .check({ key: emailKey, versionstamp: null })
        .set(idKey, user)
        .set(emailKey, user)
        .commit();
        
      if (!result.ok) { throw new Error("Failed to create user, email may already exist") };
      
      return user;
    } catch (error) {
      console.error("User creation error:", error);
      throw new Error("Failed to create user");
    }
  }
  
  async getUserById(userId: string) {
    const idKey = [...this.userIdPrefix, userId];
    const userEntry = await kv.get(idKey);
    
    if (!userEntry.value) { return null };
    return userEntry.value;
  }
  
  async updateUser(userId: string, data: Record<string, unknown>) {
    try {
      const idKey = [...this.userIdPrefix, userId];
      const userEntry = await kv.get(idKey);
      
      if (!userEntry.value) { return null };
      
      const user = userEntry.value as Record<string, unknown>;
      const emailKey = [...this.userEmailPrefix, user.email as string];
      
      const updatedUser = { ...user, ...data };
      
      const result = await kv.atomic()
        .check({ key: idKey, versionstamp: userEntry.versionstamp })
        .set(idKey, updatedUser)
        .set(emailKey, updatedUser)
        .commit();
        
      if (!result.ok) { throw new Error("Failed to update user") };
      
      return updatedUser;
    } catch (error) {
      console.error("User update error:", error);
      return null;
    }
  }
}

export const userStore = new DenoKvUserStore();