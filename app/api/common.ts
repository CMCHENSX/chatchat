import {NextRequest, NextResponse} from "next/server";
import type { LoginResponse } from "./login/route";
import type { RegisterResponse } from "./register/route";
// import {useAuthStore} from "@/app/store";
// import { getHeaders } from "../client/api";
// import { post } from '../client/request'
export const OPENAI_URL = "api.openai.com";
const DEFAULT_PROTOCOL = "https";
const PROTOCOL = process.env.PROTOCOL ?? DEFAULT_PROTOCOL;
const BASE_URL = process.env.BASE_URL ?? OPENAI_URL;

// export async function requestOpenai(req: NextRequest) {
//   const controller = new AbortController();
//   const authValue = req.headers.get("Authorization") ?? "";
//   const openaiPath = `${req.nextUrl.pathname}${req.nextUrl.search}`.replaceAll(
//     "/api/openai/",
//     "",
//   );
//
//   let baseUrl = BASE_URL;
//
//   if (!baseUrl.startsWith("http")) {
//     baseUrl = `${PROTOCOL}://${baseUrl}`;
//   }
//
//   // if (process.env.OPENAI_ORG_ID) {
//   //   console.log("[Org ID]", process.env.OPENAI_ORG_ID);
//   // }
//
// 	const timeoutId = setTimeout(() => {
// 		controller.abort();
// 	}, 10 * 60 * 1000);
//
//   const fetchUrl = `${baseUrl}/${openaiPath}`;
// 	const fetchOptions: RequestInit = {
// 		headers: {
// 			"Content-Type": "application/json",
// 			Authorization: authValue,
// 			...(process.env.OPENAI_ORG_ID && {
// 				"OpenAI-Organization": process.env.OPENAI_ORG_ID,
// 			}),
// 		},
// 		cache: "no-store",
// 		method: req.method,
// 		body: req.body,
// 		signal: controller.signal,
// 	};
//
// 	try {
// 		const res = await fetch(fetchUrl, fetchOptions);
//
// 		if (res.status === 401) {
// 			// to prevent browser prompt for credentials
// 			const newHeaders = new Headers(res.headers);
// 			newHeaders.delete("www-authenticate");
// 			return new Response(res.body, {
// 				status: res.status,
// 				statusText: res.statusText,
// 				headers: newHeaders,
// 			});
// 		}
//
// 		return res;
// 	} finally {
// 		clearTimeout(timeoutId);
// 	}
// }

export async function request(req: NextRequest) {
  let baseUrl = BASE_URL;
  if (!baseUrl.startsWith("http")) {
    baseUrl = `${PROTOCOL}://${baseUrl}`;
  }

  const authValue = req.headers.get("Authorization") ?? "";
  const uri = `${req.nextUrl.pathname}${req.nextUrl.search}`
	//   .replaceAll(
  //   "/api/",
  //   "",
  // );
  const res = await fetch(`${baseUrl}${uri}`, {
	  headers: {
		  "Content-Type": "application/json",
		  Authorization: authValue,
		  Cookie: req.headers.get("Cookie") ?? ""
	  },
	  cache: "no-store",
	  method: req.method,
	  body: req.body,
  });
	return res;

}

export interface Response<T> {
  code: number;

  message: string;

  data: T;
}

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
				// ...getHeaders(),
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
				// ...getHeaders(),
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
				// ...getHeaders(),
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
