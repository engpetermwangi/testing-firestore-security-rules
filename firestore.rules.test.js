const testing = require("@firebase/rules-unit-testing");
const { initializeTestEnvironment, assertSucceeds, assertFails } = testing;
const { getDoc, doc, setDoc, setLogLevel } = require("@firebase/firestore");

const PROJECT_ID = "YOUR_UNIQUE_PROJECT_ID";
const FIRESTORE_EMULATOR_HOST = "localhost";
const FIRESTORE_EMULATOR_PORT = 8080;

/**
 * @type testing.RulesTestEnvironment
 */
let env;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { host: FIRESTORE_EMULATOR_HOST, port: FIRESTORE_EMULATOR_PORT },
  });
  setLogLevel("error");
});

afterEach(async () => {
  await env.clearFirestore();
});

afterAll(async () => {
  await env.cleanup();
});

test("public user profile can be read by anyone, authenticated or not", async () => {
  const db = env.unauthenticatedContext().firestore();
  await assertSucceeds(getDoc(doc(db, "users/foo")));
});

test("public user profile can only be updated by authenticated user updating own profile", async () => {
  const USER_ID = "user123";
  const ANOTHER_USER_ID = "user12345";
  const db = env.authenticatedContext(USER_ID).firestore();
  await assertSucceeds(
    setDoc(doc(db, `users/${USER_ID}`), { name: "New Name" })
  );
  await assertFails(
    setDoc(doc(db, `users/${ANOTHER_USER_ID}`), { name: "Yet Another Name" })
  );
});
