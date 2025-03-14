import React from 'react';
import * as auth from "../utils/auth.js";

function CheckToken(token) {
    return (auth.checkToken(token));
}

export default CheckToken;
