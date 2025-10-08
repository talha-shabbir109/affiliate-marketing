// src/utils/asyncHandler.js
// This function wraps any async controller so that
// if an error occurs, it automatically goes to Express error handling.
export default function asyncHandler(fn) {
	return (req, res, next) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
}
