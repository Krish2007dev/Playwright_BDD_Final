export const LOGIN_USERS = {
  standard: {
    username: "standard_user",
    password: "secret_sauce",
    description: "Standard user with full access",
  },
  locked: {
    username: "locked_out_user",
    password: "secret_sauce",
    description: "Locked out user - should see error on login",
  },
  problem: {
    username: "problem_user",
    password: "secret_sauce",
    description: "Problem user - may show inconsistent behavior",
  },
  performance: {
    username: "performance_glitch_user",
    password: "secret_sauce",
    description: "Performance glitch user - slow page loads",
  },
  invalidPassword: {
    username: "standard_user",
    password: "wrong_password",
    description: "Valid username but wrong password",
  },
} as const;

export const LOGIN_ERRORS = {
  lockedOut: "Epic sadface: Sorry, this user has been locked out.",
  invalidCredentials:
    "Epic sadface: Username and password do not match any user in this service",
  usernameRequired: "Epic sadface: Username is required",
  passwordRequired: "Epic sadface: Password is required",
} as const;

export const UI_URLS = {
  saucedemo: {
    login: "https://www.saucedemo.com/",
    inventory: "/inventory.html",
    cart: "/cart.html",
  },
  playwright: {
    home: "https://playwright.dev/",
    docs: "https://playwright.dev/docs/intro",
  },
} as const;

export const API_ENDPOINTS = {
  users: {
    list: "/users",
    single: (id: number) => `/users/${id}`,
    posts: (userId: number) => `/users/${userId}/posts`,
  },
  posts: {
    list: "/posts",
    single: (id: number) => `/posts/${id}`,
    create: "/posts",
    update: (id: number) => `/posts/${id}`,
    delete: (id: number) => `/posts/${id}`,
  },
  comments: {
    list: "/comments",
    byPost: (postId: number) => `/posts/${postId}/comments`,
  },
} as const;

/**
 * Sample request bodies for API tests.
 * These are the JSON payloads sent in POST/PUT requests.
 */
export const API_REQUEST_BODIES = {
  createPost: {
    title: "My New Post",
    body: "This is the content of the post.",
    userId: 1,
  },
  updatePost: {
    id: 1,
    title: "Updated Post Title",
    body: "Updated content.",
    userId: 1,
  },
} as const;

/**
 * Expected HTTP status codes for quick reference.
 * Using named constants instead of raw numbers makes tests more readable.
 *
 * EXAMPLE:
 *   expect(response.status()).toBe(HTTP_STATUS.OK);
 *   // reads better than:
 *   expect(response.status()).toBe(200);
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;
