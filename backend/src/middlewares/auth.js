import { getAuthenticatedUser } from "../services/sessionService.js";

export async function optionalAuth(request, response, next) {
  try {
    request.user = await getAuthenticatedUser(request, response);
    return next();
  } catch (error) {
    return next(error);
  }
}

export async function requireAuth(request, response, next) {
  try {
    request.user = await getAuthenticatedUser(request, response);

    if (!request.user) {
      return response.status(401).json({
        message: "Autenticação necessária.",
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
}
