import React from 'react';
import * as auth from "../utils/auth.js";

function CheckToken(token) {
    var res = auth.checkToken(token);
    console.log(res);
    return res;
}

export default CheckToken;
