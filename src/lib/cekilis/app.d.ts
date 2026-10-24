declare const worker: { fetch(request: Request, env?: { APIFY_API_TOKEN?: string }): Promise<Response> };
export default worker;
