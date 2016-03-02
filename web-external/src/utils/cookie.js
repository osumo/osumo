
import { default as _ } from "underscore";

function cookieMapper(cookie) {
    cookie = cookie.trim();
    var index = cookie.indexOf("=");
    var key = cookie;
    var value = "";

    if(index >= 0) {
        [key, value] = [cookie.substr(0, index), cookie.substr(index+1)];
    }

    return [key, value];
}

function cookieReducer(partial, cookie, query) {
    var [key, value] = cookie;
    if(!query || key in query) {
        partial[key] = value;
    }
    return partial;
}

export function searchCookies(query, cookieString=null) {
    cookieString = cookieString || document.cookie;

    var isString = _.isString(query);
    var isObject = _.isObject(query);

    var queryAll = !(isString || isObject);

    var result;

    if(queryAll) {
        result = (
           _.chain(cookieString.split(";"))
            .map(cookieMapper)
            .reduce((partial, cookie) => cookieReducer(partial, cookie, null),
                    {})
            .value());
    } else {
        var queryString;
        if(isString) {
            queryString = query;
            query = {};
            query[queryString] = true;
        }

        query = (
           _.chain(query || {})
            .map((value, key) => [key, value])
            .filter((x) => x[1])
            .map((x) => x[0])
            .reduce((partial, key) => {
                partial[key] = null;
                return partial;
            }, {})
            .value());

        result = (
           _.chain(cookieString.split(";"))
            .reverse()
            .map(cookieMapper)
            .uniq(false, (x) => x[0])
            .reduce((partial, cookie) => cookieReducer(partial, cookie, query),
                    {})
            .value());

        if(isString) {
            result = result[queryString];
        }
    }

    return result;
};

