// import type { ChatRequest, ChatResponse } from "./api/openai/typing";
import type { LoginResponse } from "./api/login/route";
import type { RegisterResponse } from "./api/register/route";
// import {
//   ChatMessage,
//   ModelConfig,
//   ModelType,
//   useAccessStore,
//   useAuthStore,
//   useAppConfig,
//   useChatStore,
// } from "./store";
// import { showToast } from "./components/ui-lib";
// import { ACCESS_CODE_PREFIX } from "./constant";
//
// const TIME_OUT_MS = 60000;

// const makeRequestParam = (
//   messages: ChatMessage[],
//   options?: {
//     stream?: boolean;
//     overrideModel?: ModelType;
//   },
// ): ChatRequest => {
//   let sendMessages = messages.map((v) => ({
//     role: v.role,
//     content: v.content,
//   }));
//
//   const modelConfig = {
//     ...useAppConfig.getState().modelConfig,
//     ...useChatStore.getState().currentSession().mask.modelConfig,
//   };
//
//   // override model config
//   if (options?.overrideModel) {
//     modelConfig.model = options.overrideModel;
//   }
//
//   return {
//     messages: sendMessages,
//     stream: options?.stream,
//     model: modelConfig.model,
//     temperature: modelConfig.temperature,
//     presence_penalty: modelConfig.presence_penalty,
//   };
// };

// function getHeaders() {
//   const authStore = useAuthStore.getState();
//   // const accessStore = useAccessStore.getState();
//   let headers: Record<string, string> = {};
//
//   const makeBearer = (token: string) => `Bearer ${token.trim()}`;
//   const validString = (x: string) => x && x.length > 0;
//
//   if (validString(authStore.token)) {
//     headers.Authorization = makeBearer(authStore.token);
//   }
//   // use user's api key first
//   // else if (validString(accessStore.token)) {
//   //   headers.Authorization = makeBearer(accessStore.token);
//   // } else if (
//   //   accessStore.enabledAccessControl() &&
//   //   validString(accessStore.accessCode)
//   // ) {
//   //   headers.Authorization = makeBearer(
//   //     ACCESS_CODE_PREFIX + accessStore.accessCode,
//   //   );
//   // }
//
//   return headers;
// }

// function logOut() {
//   useAuthStore.getState().logout();
// }
// export function requestOpenaiClient(path: string) {
//   const openaiUrl = useAccessStore.getState().openaiUrl;
//   // console.log('openaiUrl = ', openaiUrl, 'path = ', path)
//   return (body: any, method = "POST") =>
//     fetch(openaiUrl + path, {
//       method,
//       body: body && JSON.stringify(body),
//       headers: getHeaders(),
//     });
// }

// // export async function requestChat(
// //   messages: ChatMessage[],
// //   options?: {
// //     model?: ModelType;
// //   },
// // ) {
// //   const req: ChatRequest = makeRequestParam(messages, {
// //     overrideModel: options?.model,
// //   });
// //
// //   const res = await requestOpenaiClient("chatgpt/v1/chat/completions")(req);
// //   // console.log('res', res)
// //   try {
// //     const response = (await res.json()) as ChatResponse;
// //     return response;
// //   } catch (error) {
// //     console.error("[Request Chat] ", error, res.body);
// //   }
// // }
//
// export async function requestUsage() {
//   const formatDate = (d: Date) =>
//     `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
//       .getDate()
//       .toString()
//       .padStart(2, "0")}`;
//   const ONE_DAY = 1 * 24 * 60 * 60 * 1000;
//   const now = new Date();
//   const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//   const startDate = formatDate(startOfMonth);
//   const endDate = formatDate(new Date(Date.now() + ONE_DAY));
//
//   const [used, subs] = await Promise.all([
//     requestOpenaiClient(
//       `dashboard/billing/usage?start_date=${startDate}&end_date=${endDate}`,
//     )(null, "GET"),
//     requestOpenaiClient("dashboard/billing/subscription")(null, "GET"),
//   ]);
//
//   const response = (await used.json()) as {
//     total_usage?: number;
//     error?: {
//       type: string;
//       message: string;
//     };
//   };
//
//   const total = (await subs.json()) as {
//     hard_limit_usd?: number;
//   };
//
//   if (response.error && response.error.type) {
//     showToast(response.error.message);
//     return;
//   }
//
//   if (response.total_usage) {
//     response.total_usage = Math.round(response.total_usage) / 100;
//   }
//
//   if (total.hard_limit_usd) {
//     total.hard_limit_usd = Math.round(total.hard_limit_usd * 100) / 100;
//   }
//
//   return {
//     used: response.total_usage,
//     subscription: total.hard_limit_usd,
//   };
// }

export interface LoginResult {
  code: number;
  message: string;
  data?: any;
}
export interface RegisterResult {
  code: number;
  message: string;
  data?: any;
}

export async function requestLogin(
  username: string,
  password: string,
  options?: {
    onError: (error: Error, statusCode?: number) => void;
  },
): Promise<LoginResult> {
  //const openaiUrl = useAccessStore.getState().openaiUrl;
  try {
    const res = await fetch("/api/user/login/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", //,
        //...getHeaders(),
      },
      body: JSON.stringify({ username, password }), //,
      //signal: controller.signal,
    });
    if (res.status == 200) {
      let json: LoginResponse;
      try {
        json = (await res.json()) as LoginResponse;
      } catch (e) {
        console.error("json formatting failure", e);
        options?.onError({
          name: "json formatting failure",
          message: "json formatting failure",
        });
        return {
          code: -1,
          message: "json formatting failure",
        };
      }
      if (json.code != 0) {
        options?.onError({
          name: json.message,
          message: json.message,
        });
      }
      return json;
    }
    console.error("login result error(2)", res);
    options?.onError({
      name: "unknown error",
      message: "unknown error",
    });
    return {
      code: -1,
      message: "unknown error",
    };
  } catch (err) {
    console.error("NetWork Error", err);
    options?.onError(err as Error);
    return {
      code: -1,
      message: "NetWork Error",
    };
  }
}

export async function requestRegister(
  name: string,
  username: string,
  password: string,
  captchaId: string,
  captchaInput: string,
  email: string,
  code: string,
  options?: {
    onError: (error: Error, statusCode?: number) => void;
  },
): Promise<RegisterResult> {
  //const openaiUrl = useAccessStore.getState().openaiUrl;
  try {
    const res = await fetch("/api/user/register/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", //,
        //...getHeaders(),
      },
      body: JSON.stringify({
        name,
        username,
        password,
        captchaId,
        captcha: captchaInput,
        email,
        code,
      }), //,
      //signal: controller.signal,
    });
    if (res.status == 200) {
      let json: RegisterResponse;
      try {
        json = (await res.json()) as RegisterResponse;
      } catch (e) {
        console.error("json formatting failure", e);
        options?.onError({
          name: "json formatting failure",
          message: "json formatting failure",
        });
        return {
          code: -1,
          message: "json formatting failure",
        };
      }
      if (json.code != 0) {
        options?.onError({
          name: json.message,
          message: json.message,
        });
      }
      return json;
    }
    console.error("register result error(2)", res);
    options?.onError({
      name: "unknown error",
      message: "unknown error",
    });
    return {
      code: -1,
      message: "unknown error",
    };
  } catch (err) {
    console.error("NetWork Error", err);
    options?.onError(err as Error);
    return {
      code: -1,
      message: "NetWork Error",
    };
  }
}

export async function requestSendEmailCode(
  email: string,
  options?: {
    onError: (error: Error, statusCode?: number) => void;
  },
): Promise<RegisterResult> {
  //const openaiUrl = useAccessStore.getState().openaiUrl;
  try {
    const res = await fetch("/api/sendRegisterEmailCode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", //,
        //...getHeaders(),
      },
      body: JSON.stringify({ email }), //,
      //signal: controller.signal,
    });
    if (res.status == 200) {
      let json: RegisterResponse;
      try {
        json = (await res.json()) as RegisterResponse;
      } catch (e) {
        console.error("json formatting failure", e);
        options?.onError({
          name: "json formatting failure",
          message: "json formatting failure",
        });
        return {
          code: -1,
          message: "json formatting failure",
        };
      }
      if (json.code != 0) {
        options?.onError({
          name: json.message,
          message: json.message,
        });
      }
      return json;
    }
    console.error("register result error(2)", res);
    options?.onError({
      name: "unknown error",
      message: "unknown error",
    });
    return {
      code: -1,
      message: "unknown error",
    };
  } catch (err) {
    console.error("NetWork Error", err);
    options?.onError(err as Error);
    return {
      code: -1,
      message: "NetWork Error",
    };
  }
}

// export async function requestChatStream(
//   messages: ChatMessage[],
//   options?: {
//     modelConfig?: ModelConfig;
//     overrideModel?: ModelType;
//     onMessage: (message: string, done: boolean) => void;
//     onError: (error: Error, statusCode?: number) => void;
//     onController?: (controller: AbortController) => void;
//   },
// ) {
//   const req = makeRequestParam(messages, {
//     stream: true,
//     overrideModel: options?.overrideModel,
//   });
//   // const authStore = useAuthStore();
//   // console.log("[Request] ", req);
//
//   const controller = new AbortController();
//   const reqTimeoutId = setTimeout(() => controller.abort(), TIME_OUT_MS);
//
//   try {
//     // const openaiUrl = useAccessStore.getState().openaiUrl;
//     // console.log('openai url = ' + openaiUrl)
//     const res = await fetch("/api/chat_message/send", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         ...getHeaders(),
//       },
//       body: JSON.stringify(req),
//       signal: controller.signal,
//     });
//     // console.log('res', res)
//
//     clearTimeout(reqTimeoutId);
//
//     let responseText = "";
//
//     const finish = () => {
//       options?.onMessage(responseText, true);
//       controller.abort();
//     };
//
//     if (res.ok) {
//       const reader = res.body?.getReader();
//       const decoder = new TextDecoder();
//
//       options?.onController?.(controller);
//
//       while (true) {
//         const resTimeoutId = setTimeout(() => finish(), TIME_OUT_MS);
//         const content = await reader?.read();
//         // console.log('content', content)
//         clearTimeout(resTimeoutId);
//
//         if (!content || !content.value) {
//           break;
//         }
//
//         const text = decoder.decode(content.value, { stream: true });
//         // console.log('text', text)
//         responseText += text;
//         const done = content.done;
//         options?.onMessage(responseText, false);
//
//         if (done) {
//           break;
//         }
//       }
//
//       finish();
//     } else if (res.status === 401) {
//       console.error("Unauthorized");
//       logOut();
//       options?.onError(new Error("Unauthorized"), res.status);
//     } else {
//       console.error("Stream Error", res.body);
//       options?.onError(new Error("Stream Error"), res.status);
//     }
//   } catch (err) {
//     console.error("NetWork Error", err);
//     options?.onError(err as Error);
//   }
// }

// export async function requestWithPrompt(
//   messages: ChatMessage[],
//   prompt: string,
//   options?: {
//     model?: ModelType;
//   },
// ) {
//   messages = messages.concat([
//     {
//       role: "user",
//       content: prompt,
//       date: new Date().toLocaleString(),
//     },
//   ]);
//
//   const res = await requestChat(messages, options);
//
//   return res?.choices?.at(0)?.message?.content ?? "";
// }

// To store message streaming controller
// export const ControllerPool = {
//   controllers: {} as Record<string, AbortController>,
//
//   addController(
//     sessionIndex: number,
//     messageId: number,
//     controller: AbortController,
//   ) {
//     const key = this.key(sessionIndex, messageId);
//     this.controllers[key] = controller;
//     return key;
//   },
//
//   stop(sessionIndex: number, messageId: number) {
//     const key = this.key(sessionIndex, messageId);
//     const controller = this.controllers[key];
//     controller?.abort();
//   },
//
//   stopAll() {
//     Object.values(this.controllers).forEach((v) => v.abort());
//   },
//
//   hasPending() {
//     return Object.values(this.controllers).length > 0;
//   },
//
//   remove(sessionIndex: number, messageId: number) {
//     const key = this.key(sessionIndex, messageId);
//     delete this.controllers[key];
//   },
//
//   key(sessionIndex: number, messageIndex: number) {
//     return `${sessionIndex},${messageIndex}`;
//   },
// };
