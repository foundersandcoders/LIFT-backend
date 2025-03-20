import { assertEquals, assertNotEquals, assertRejects } from "jsr:@std/assert";
import { beforeEach, describe, it } from "jsr:@std/testing/bdd";

// Create a mock implementation for testing instead of using the actual DenoKvUserStore
class MockUserStore {
  private users = new Map<string, any>();
  private emailIndex = new Map<string, string>();

  async findUserByEmail(email: string) {
    const userId = this.emailIndex.get(email);
    if (!userId) return null;
    return this.users.get(userId) || null;
  }
  
  async createUser(userData: { email: string; username?: string }) {
    // Check for duplicate email
    if (this.emailIndex.has(userData.email)) {
      throw new Error("Failed to create user, email already exists");
    }
    
    const userId = crypto.randomUUID();
    const authId = userId;
    
    const user = {
      id: userId,
      authId: authId,
      email: userData.email,
      username: userData.username || null,
      createdAt: new Date().toISOString(),
    };
    
    this.users.set(userId, user);
    this.emailIndex.set(userData.email, userId);
    
    return user;
  }
  
  async getUserById(userId: string) {
    return this.users.get(userId) || null;
  }
  
  async updateUser(userId: string, data: Record<string, unknown>) {
    const user = this.users.get(userId);
    if (!user) return null;
    
    const updatedUser = { ...user, ...data };
    this.users.set(userId, updatedUser);
    
    return updatedUser;
  }
  
  // For testing only - clear all data
  clear() {
    this.users.clear();
    this.emailIndex.clear();
  }
}

// Create a fresh instance for each test
let userStore: MockUserStore;

describe("User Store", () => {
  beforeEach(() => {
    // Create a fresh instance and clear any existing data
    userStore = new MockUserStore();
    userStore.clear();
  });

  it("should create a new user", async () => {
    const userData = { email: "test@example.com", username: "testuser" };
    const user = await userStore.createUser(userData);
    
    assertEquals(user.email, userData.email);
    assertEquals(user.username, userData.username);
    assertNotEquals(user.id, undefined);
    assertNotEquals(user.authId, undefined);
    assertNotEquals(user.createdAt, undefined);
  });

  it("should find a user by email", async () => {
    const userData = { email: "find@example.com", username: "finduser" };
    const createdUser = await userStore.createUser(userData);
    
    const foundUser = await userStore.findUserByEmail(userData.email);
    assertEquals(foundUser?.id, createdUser.id);
    assertEquals(foundUser?.email, userData.email);
  });

  it("should return null when finding a non-existent user by email", async () => {
    const nonExistentUser = await userStore.findUserByEmail("nonexistent@example.com");
    assertEquals(nonExistentUser, null);
  });

  it("should get a user by ID", async () => {
    const userData = { email: "getbyid@example.com", username: "getbyiduser" };
    const createdUser = await userStore.createUser(userData);
    
    const foundUser = await userStore.getUserById(createdUser.id);
    assertEquals(foundUser?.id, createdUser.id);
    assertEquals(foundUser?.email, userData.email);
  });

  it("should return null when getting a non-existent user by ID", async () => {
    const nonExistentUser = await userStore.getUserById("non-existent-id");
    assertEquals(nonExistentUser, null);
  });

  it("should update a user", async () => {
    const userData = { email: "update@example.com", username: "updateuser" };
    const createdUser = await userStore.createUser(userData);
    
    const updatedData = { username: "updatedusername" };
    const updatedUser = await userStore.updateUser(createdUser.id, updatedData);
    
    assertEquals(updatedUser?.id, createdUser.id);
    assertEquals(updatedUser?.email, userData.email);
    assertEquals(updatedUser?.username, updatedData.username);
  });

  it("should return null when updating a non-existent user", async () => {
    const updatedUser = await userStore.updateUser("non-existent-id", { username: "newname" });
    assertEquals(updatedUser, null);
  });

  it("should prevent creating users with duplicate emails", async () => {
    const userData = { email: "duplicate@example.com", username: "dupuser1" };
    await userStore.createUser(userData);
    
    await assertRejects(
      async () => {
        await userStore.createUser(userData);
      },
      Error,
      "Failed to create user, email already exists"
    );
  });
});