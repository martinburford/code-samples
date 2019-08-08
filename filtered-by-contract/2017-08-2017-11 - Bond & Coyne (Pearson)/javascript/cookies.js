const cookies = (function(){
	/**
	 * Set a cookie keys value
	 * @function set
	 * @param {string} name - The key name for the cookie entry
	 * @param {string} value - The value to populate the new cookie key
	 * @param {number} options.expire - The expiry of the cookie in days
	 * @param {string} options.domain - The domain to store the cookie against
	 * @param {string} options.path - A specific path within the domain to register the cookie against
	 * @param {boolean} options.secure - Whether or not the cookie will be only transmitted over https
	 * @param {boolean} options.httponly - Whether the cookie may only be read by the web server
	 */
	const set = (name, value, options) => {
		// Retrieve options and defaults
		const opts = options || {};
		const defaults = {};

		// Apply default value for unspecified options
		const expires = opts.expires || defaults.expires;
		const domain = opts.domain || defaults.domain;
		const path = opts.path !== undefined ? opts.path : (defaults.path !== undefined ? defaults.path : '/');
		const secure = opts.secure !== undefined ? opts.secure : defaults.secure;
		const httponly = opts.httponly !== undefined ? opts.httponly : defaults.httponly;

		// Determine cookie expiration date
		// If succesful the result will be a valid Date, otherwise it will be an invalid Date or false(ish)
		const expDate = expires ? new Date(
			// in case expires is an integer, it should specify the number of days till the cookie expires
			typeof expires === 'number' ? new Date().getTime() + (expires * 864e5) :
			// else expires should be either a Date object or in a format recognized by Date.parse()
			expires
		) : '';

		// Set cookie
		document.cookie = name.replace(/[^+#$&^`|]/g, encodeURIComponent) // Encode cookie name
			.replace('(', '%28')
			.replace(')', '%29') +
			'=' + value.replace(/[^+#$&/:<-\[\]-}]/g, encodeURIComponent) + // Encode cookie value (RFC6265)
			(expDate && expDate.getTime() >= 0 ? ';expires=' + expDate.toUTCString() : '') + // Add expiration date
			(domain ? ';domain=' + domain : '') + // Add domain
			(path ? ';path=' + path   : '') + // Add path
			(secure ? ';secure' : '') + // Add secure option
			(httponly ? ';httponly' : ''); // Add httponly option
	};

	/**
	 * Retrieve a specified cookie keys value
	 * @function get
	 * @param {string} name - The key name of the cookie to return the value for
	 * @returns {string} - The value for the specified cookie key. Null is returned if no matching cookie key was found
	 */
	const get = (name) => {
		const cookies = document.cookie.split(';');

		// Iterate all cookies
		for(let i = 0; i<cookies.length; i++){
			let cookie = cookies[i];
			let cookieLength = cookie.length;

			// Determine separator index ("name=value")
			let separatorIndex = cookie.indexOf('=');

			// IE<11 emits the equal sign when the cookie value is empty
			separatorIndex = separatorIndex < 0 ? cookieLength : separatorIndex;

			let cookie_name = decodeURIComponent(cookie.substring(0, separatorIndex).replace(/^\s+/, ''));

			// Return cookie value if the name matches
			if(cookie_name === name){
				return decodeURIComponent(cookie.substring(separatorIndex + 1, cookieLength));
			}
		}

		// Return 'null' as the cookie was not found
		return null;
	}

	/**
	 * Delete a specified cookie key
	 * @function erase
	 * @param {string} name - The name of the cookie key to be removed
	 * @param {string} options.domain - The domain the cookie is regsitered against
	 * @param {string} options.path - A specific path within the domain the cookie is registered against
	 */
	const erase = (name, options) => {
		set(name, '', {
			expires: -1,
			domain: options && options.domain,
			path: options && options.path,
			secure: 0,
			httponly: 0
		});
	}

  return {
	set,
	get,
	erase
  }
}());

export default cookies;