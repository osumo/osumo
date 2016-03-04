
import { chain, isObject, isString } from "underscore";

const mapper = (cookie) => {
    cookie = cookie.trim();
    let index = cookie.indexOf("=");
    let key = cookie;
    let value = "";

    if(index >= 0) {
        [key, value] = [cookie.substr(0, index), cookie.substr(index+1)];
    }

    return [key, value];
};


const reducer = (partial, cookie, query) => {
    let [key, value] = cookie;
    if(!query || key in query) {
        partial[key] = value;
    }
    return partial;
};

const search = (query, cookieString=null) => {
    cookieString = cookieString || document.cookie;

    let isString = isString(query);
    let isObject = isObject(query);

    let queryAll = !(isString || isObject);

    let result;

    if(queryAll) {
        result = (
            chain(cookieString.split(";"))
            .map(mapper)
            .reduce((partial, cookie) => reducer(partial, cookie, null),
                    {})
            .value());
    } else {
        let queryString;
        if(isString) {
            queryString = query;
            query = {};
            query[queryString] = true;
        }

        query = (
            chain(query || {})
            .map((value, key) => [key, value])
            .filter((x) => x[1])
            .map((x) => x[0])
            .reduce((partial, key) => {
                partial[key] = null;
                return partial;
            }, {})
            .value());

        result = (
            chain(cookieString.split(";"))
            .reverse()
            .map(mapper)
            .uniq(false, (x) => x[0])
            .reduce((partial, cookie) => reducer(partial, cookie, query),
                    {})
            .value());

        if(isString) {
            result = result[queryString];
        }
    }

    return result;
};

export { mapper, reducer, search };

