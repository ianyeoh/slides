import request from 'supertest';
import server from '../src/server';
import { reset } from '../src/service';

const postTry = async (path, status, payload, token) => sendTry('post', path, status, payload, token);
const getTry = async (path, status, payload, token) => sendTry('get', path, status, payload, token);
const deleteTry = async (path, status, payload, token) => sendTry('delete', path, status, payload, token);
const putTry = async (path, status, payload, token) => sendTry('put', path, status, payload, token);

const sendTry = async (typeFn, path, status = 200, payload = {}, token = null) => {
  let req = request(server);
  if (typeFn === 'post') {
    req = req.post(path);
  } else if (typeFn === 'get') {
    req = req.get(path);
  } else if (typeFn === 'delete') {
    req = req.delete(path);
  } else if (typeFn === 'put') {
    req = req.put(path);
  }
  if (token !== null) {
    req = req.set('Authorization', `Bearer ${token}`);
  }
  const response = await req.send(payload);
  expect(response.statusCode).toBe(status);
  return response.body;
};

const validToken = async () => {
  const { token } = await postTry('/admin/auth/login', 200, {
    email: 'hayden.smith@unsw.edu.au',
    password: 'bananapie',
  });
  return token;
}

const singleQuizId = async () => {
  const { quizzes } = await getTry('/admin/quiz', 200, {}, await validToken());
  const quizid = quizzes[0].id;
  return quizid;
};

const singleSessionStatus = async () => {
  const { quizzes } = await getTry('/admin/quiz', 200, {}, await validToken());
  const sessionid = quizzes[0].active;
  const body = await getTry(`/admin/session/${sessionid}/status`, 200, {}, await validToken());
  return body.results;
};

const singleSessionId = async () => {
  const { quizzes } = await getTry('/admin/quiz', 200, {}, await validToken());
  return quizzes[0].active;
};

describe('Test the root path', () => {

  beforeAll(() => {
    reset();
  });

  beforeAll(() => {
    server.close();
  });

  /***************************************************************
                       Auth Tests
  ***************************************************************/

  test('Registration of initial user', async () => {
    const body = await postTry('/admin/auth/register', 200, {
      email: 'hayden.smith@unsw.edu.au',
      password: 'bananapie',
      name: 'Hayden',
    });
    expect(body.token instanceof String);
  });

  test('Inability to re-register a user', async () => {
    const body = await postTry('/admin/auth/register', 400, {
      email: 'hayden.smith@unsw.edu.au',
      password: 'bananapie',
      name: 'Hayden',
    });
  });

  test('Login to an existing user', async () => {
    const body = await postTry('/admin/auth/login', 200, {
      email: 'hayden.smith@unsw.edu.au',
      password: 'bananapie',
    });
    expect(body.token instanceof String);
  });

  test('Login attempt with invalid credentials 1', async () => {
    const body = await postTry('/admin/auth/login', 400, {
      email: 'hayden.smith@unsw.edu.a',
      password: 'bananapie',
    });
  });

  test('Login attempt with invalid credentials 2', async () => {
    const body = await postTry('/admin/auth/login', 400, {
      email: 'hayden.smith@unsw.edu.au',
      password: 'bananapi',
    });
  });

  test('Logout a valid session', async () => {
    const bodyLogout = await postTry('/admin/auth/logout', 200, {}, await validToken());
    expect(bodyLogout).toMatchObject({});
  });

  test('Logout a session without auth token', async () => {
    const body = await postTry('/admin/auth/logout', 403, {});
    expect(body).toMatchObject({});
  });

  /***************************************************************
                       Store Tests
  ***************************************************************/
  
  const STORE_1 = {
    name:' Hayden',
    height: 100,
  }

  test('Initially there is an empty store', async () => {
    const body = await getTry('/store', 200, {}, await validToken());
    expect(body.store).toMatchObject({ store: {} });
  });

  test('Adding to the store', async () => {
    const body = await putTry('/store', 200, { store: STORE_1 }, await validToken());
  });

  test('Chcek if the store was updated', async () => {
    const body = await getTry('/store', 200, {}, await validToken());
    expect(body.store).toMatchObject({ store: STORE_1 });
  });

});