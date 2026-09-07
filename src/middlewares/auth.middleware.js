import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // التحقق من وجود Authorization Header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    // استخراج التوكن
    const accessToken = authHeader.split(" ")[1];


    // التحقق من صحة التوكن
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);


    req.user = decoded;

    next();
  } catch (error) {
    console.error("JWT Error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      // The library message ("jwt malformed", "invalid signature",
      // "jwt signature is required") tells an attacker which part of the
      // token was wrong. The real reason stays in the log above.
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access only",
      });
    }

    next();
  } catch (error) {
    console.error("[auth] admin check failed:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};