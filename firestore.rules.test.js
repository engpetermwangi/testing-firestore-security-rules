import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";
import { getDoc, doc, setDoc } from "@firebase/firestore";

const PROJECT_ID = "YOUR_UNIQUE_PROJECT_ID";
const FIRESTORE_EMULATOR_HOST = "localhost";
const FIRESTORE_EMULATOR_PORT = 8080;

let env;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { host: FIRESTORE_EMULATOR_HOST, port: FIRESTORE_EMULATOR_PORT },
  });
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
  const db = env.authenticatedContext(USER_ID).firestore();
  await assertSucceeds(
    setDoc(doc(db, `users/${USER_ID}`), { name: "New Name" })
  );
  await assertFails(
    setDoc(doc(db, `users/anotherUserId`), { name: "Yet Another Name" })
  );
});
