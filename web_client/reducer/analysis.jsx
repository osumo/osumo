import { isArray, isNil, isNumber, isString, isUndefined } from 'lodash';
import ACTION_TYPES from './action-types';
import objectReduce from '../utils/object-reduce';

const isScalar = (x) => (isNumber(x) || isString(x));
const ensure = (x, def) => (isNil(x) ? def : x);

const allocateId = (allocator = {}) => {
  let { maxId, freeList } = allocator;
  if (isNil(maxId)) { maxId = -1; }
  freeList = freeList || [];

  let newId = maxId + 1;
  if (freeList.length) {
    newId = freeList[freeList.length - 1];
    freeList = freeList.slice(0, freeList.length - 1);
  } else {
    maxId = newId;
  }

  return { id: newId, maxId, freeList };
};

const returnId = (idList, allocator = {}) => {
  let { maxId, freeList } = allocator;
  maxId = maxId || 0;
  freeList = freeList || [];

  if (!isArray(idList)) { idList = [idList]; }

  idList = idList.filter((id) => (id <= maxId && freeList.indexOf(id) < 0));
  if (!idList.length) { return allocator; }

  return {
    ...allocator,
    freeList: [...freeList, ...idList]
  };
};

const addAnalysisElement = (analysis, element, parent) => {
  let { idAllocator, lastPageId, objects, parents } = analysis;
  idAllocator = ensure(idAllocator, {});
  objects = ensure(objects, {});
  parents = ensure(parents, {});

  parent = ensure(parent, lastPageId);
  parent = ensure(parent, 'no-parent');
  if (parent === 'no-parent') { return analysis; }

  if (!isScalar(parent)) { parent = parent.id; }
  parent = ensure(objects[parent], 'no-parent');

  if (parent === 'no-parent') { return analysis; }

  if (isNil(element.id)) {
    idAllocator = allocateId(idAllocator);
    element = { ...element, id: idAllocator.id };

    analysis = { ...analysis, idAllocator };
  }

  if (objects[element.id] !== element) {
    objects = { ...objects };
    objects[element.id] = element;

    analysis = { ...analysis, objects };
  }

  objects = { ...objects };
  objects[parent.id] = {
    ...parent,
    elements: [ ...ensure(parent.elements, []), Number(element.id) ]
  };

  parents = { ...parents };
  parents[element.id] = parent.id;

  analysis = { ...analysis, objects, parents };

  return analysis;
};

const addAnalysisPage = (analysis, page) => {
  page = ensure(page, 'no-page');
  if (page === 'no-page') { return analysis; }

  let { currentPage, idAllocator, objects, pages } = analysis;
  idAllocator = ensure(idAllocator, {});
  objects = ensure(objects, {});
  pages = ensure(pages, []);

  if (isNil(page.id)) {
    idAllocator = allocateId(idAllocator);
    page = { ...page, id: idAllocator.id };

    analysis = { ...analysis, idAllocator };
  }

  if (isNil(page.elements)) {
    page = { ...page, elements: [] };
  }

  if (isNil(page.enabled)) {
    page = { ...page, enabled: true };
  }

  if (isNil(currentPage)) {
    currentPage = page.id;
  }

  objects = { ...objects };
  objects[page.id] = page;

  analysis = {
    ...analysis,
    currentPage,
    objects,
    pages: [ ...pages, Number(page.id) ],
    lastPageId: page.id
  };

  return analysis;
};

const removeAnalysisElement = (analysis, element) => {
  let { objects, parents } = analysis;
  objects = ensure(objects, {});

  element = ensure(element, 'no-element');
  if (element === 'no-element') { return analysis; }

  if (!isArray(element)) { element = [element]; }

  /* normalize the list of provided elements to just their ids */
  let failedValidation = false;
  element = element.map((e) => {
    if (failedValidation) { return; }
    if (isScalar(e)) { e = ensure(objects[e], 'no-element'); }
    if (e === 'no-element') {
      failedValidation = true;
      return;
    }

    return e.id;
  });
  if (failedValidation) { return analysis; }

  /* ensure that none of the provided elements are actually pages! */
  failedValidation = element.some((e) => {
    let p = ensure(objects[parents[e]], 'no-parent');
    return (p === 'no-parent');
  });
  if (failedValidation) { return analysis; }

  /*
   * construct the initial set of ids that are to be freed
   * this set will be expanded recursively
   */
  let idSet = (
    element
      .map((id) => [id, true])
      .reduce(objectReduce, {})
  );

  /* this is the function that will recursively expand the id set */
  const excludeChildren = (parent) => {
    let { elements } = parent;

    elements = ensure(elements, []);

    /* already excluded */
    let ids = elements.filter((id) => !idSet[id]);
    elements = ids.map((id) => objects[id]);

    idSet = {
      ...idSet,
      ...(
        ids
          .map((id) => [id, true])
          .reduce(objectReduce, {})
      )
    };

    elements.forEach(excludeChildren);
  };

  /* first pass: expand the id set (no modifications) */
  (
    Object.entries(objects)
      .filter(([id]) => Boolean(idSet[id]))
      .map(([, obj]) => obj)
      .forEach(excludeChildren)
  );

  /*
   * second pass: remove the filtered objects and their
   *              entries from any parent objects
   */
  objects = (
    Object.entries(objects)
      .filter(([id]) => !idSet[id])
      .map(([id, obj]) => {
        let { elements } = obj;
        elements = ensure(elements, []).filter((id) => !idSet[id]);
        obj = { ...obj, elements };
        return [id, obj];
      })
      .reduce(objectReduce, {})
  );

  analysis = { ...analysis, objects };

  /*
   * if some ids should be freed,
   *     return them to the allocator
   *     and remove their parent entries, if any
   */
  let freedIds = Object.keys(idSet);
  if (freedIds.length) {
    let { idAllocator } = analysis;
    idAllocator = ensure(idAllocator, {});
    idAllocator = returnId(freedIds, idAllocator);

    parents = (
      Object.entries(parents)
        .filter(([id]) => !idSet[id])
        .reduce(objectReduce, {})
    );

    analysis = { ...analysis, idAllocator, parents };
  }

  return analysis;
};

const removeAnalysisPage = (analysis, page) => {
  let { currentPage, lastPageId, objects, pages, parents } = analysis;
  objects = ensure(objects, []);
  pages = ensure(pages, []);
  parents = ensure(parents, {});

  page = ensure(page, lastPageId);
  page = ensure(page, 'no-page');
  if (page === 'no-page') { return analysis; }

  if (!isArray(page)) { page = [page]; }

  let clearLastPageId = false;
  let failedValidation = false;
  page = page.map((p) => {
    if (failedValidation) { return; }
    if (isScalar(p)) { p = ensure(objects[p], 'no-page'); }
    if (p === 'no-page') {
      failedValidation = true;
      return;
    }

    clearLastPageId = clearLastPageId || lastPageId === p.id;

    return p.id;
  });
  if (failedValidation) { return analysis; }

  if (clearLastPageId) {
    ({ lastPageId, ...analysis } = analysis);
  }

  /*
   * construct the initial set of ids that are to be freed
   * this set will be expanded recursively
   */
  let clearCurrentPage = false;
  let idSet = (
    page
      .map((id) => {
        /* record whether the currentPage is being removed */
        if (!clearCurrentPage && id === currentPage) {
          clearCurrentPage = true;
        }
        return [id, true];
      })
      .reduce(objectReduce, {})
  );

  if (clearCurrentPage) {
    currentPage = null;
  }

  let referencedForms = {};

  /* this is the function that will recursively expand the id set */
  const excludeChildren = (parent) => {
    let { elements } = parent;
    elements = ensure(elements, []);

    /* already excluded */
    let ids = elements.filter((id) => !idSet[id]);
    elements = ids.map((id) => objects[id]);

    idSet = {
      ...idSet,
      ...(
        ids
          .map((id) => [id, true])
          .reduce(objectReduce, {})
      )
    };

    elements.forEach(excludeChildren);
  };

  /* first pass: expand the id set (no modifications) */
  (
    pages
      .filter((id) => Boolean(idSet[id]))
      .map((id) => objects[id])
      .forEach(excludeChildren)
  );

  /* second pass: remove the filtered pages */
  pages = pages.filter((id) => {
    let { key } = objects[id];
    let excluded = Boolean(idSet[id]);

    /*
     * As a side-effect, determine whether the form for this page should be
     * removed.
     *
     * Criteria:
     *   - If this page should remain, the form it uses should not be cleared.
     *   - If this page should be removed, the form it uses should go as well.
     *     - ... **unless** it's needed for another page.
     */
    referencedForms[key] = referencedForms[key] || !excluded;
    return !excluded;
  });

  /*
   * third pass: remove the filtered objects and their
   *             entries from any parent objects
   */
  objects = (
    Object.entries(objects)
      .filter(([id]) => !idSet[id])
      .map(([id, obj]) => {
        let { elements } = obj;
        elements = ensure(elements, []).filter((id) => !idSet[id]);
        obj = { ...obj, elements };
        return [id, obj];
      })
      .reduce(objectReduce, {})
  );

  analysis = { ...analysis, currentPage, objects, pages };

  /*
   * if some ids should be freed,
   *     return them to the allocator
   *     and remove their parent entries, if any
   */
  let freedIds = Object.keys(idSet);
  if (freedIds.length) {
    let { idAllocator } = analysis;
    idAllocator = ensure(idAllocator, {});
    idAllocator = returnId(freedIds, idAllocator);

    parents = { ...parents };
    freedIds.forEach((id) => { delete parents[id]; });

    analysis = { ...analysis, idAllocator, parents };
  }

  /* remove any forms that no longer have any pages using them */
  let thereAreFormsToFree = (
    Object.entries(referencedForms)
      .some(([, keep]) => !keep)
  );

  if (thereAreFormsToFree) {
    let { forms } = analysis;
    forms = ensure(forms, {});
    forms = (
      Object.entries(forms)
        .filter(([form]) => referencedForms[form])
        .reduce(objectReduce, {})
    );

    analysis = { ...analysis, forms };
  }

  return analysis;
};

const removeAnalysisPageByKey = (analysis, key) => {
  let { objects, pages } = analysis;
  objects = ensure(objects, {});
  pages = ensure(pages, []);

  key = ensure(key, 'no-key');
  if (key === 'no-key') { return analysis; }

  if (!isArray(key)) { key = [key]; }

  let keySet = (
    key
      .map((k) => [k, true])
      .reduce(objectReduce, {})
  );

  let failedValidation = false;
  let idSet = pages.map((page) => {
    if (failedValidation) { return; }
    if (isScalar(page)) { page = ensure(objects[page], 'no-page'); }
    if (page === 'no-page') {
      failedValidation = true;
      return;
    }

    return [page.id, page.key];
  });

  if (failedValidation) { return analysis; }

  idSet = (
    idSet
      .filter(([, k]) => (keySet[k]))
      .map(([id]) => id)
  );

  if (idSet.length) { analysis = removeAnalysisPage(analysis, idSet); }

  return analysis;
};

const truncateAnalysisPages = (analysis, numPages, options={}) => {
  let { pages, objects } = analysis;
  pages = ensure(pages, []);

  options = ensure(options, {});
  let { clear, disable, remove } = options;
  clear = ensure(clear, true);
  disable = ensure(disable, true);
  remove = ensure(remove, true);

  let pagesToModify = pages.slice(numPages, pages.length);
  if (pagesToModify.length) {
    if (remove) { /* the rest is moot */
      analysis = removeAnalysisPage(analysis, pagesToModify);
    } else {
      if (disable) {
        analysis = disableAnalysisPage(analysis, pagesToModify);
      }

      if (clear) {
        let idSet = Object.keys(
          pagesToModify
            .map((page) => objects[page].elements)
            .reduce((a, b) => a.concat(b), [])
            .map((element) => [element, true])
            .reduce(objectReduce, {})
        );

        analysis = removeAnalysisElement(analysis, idSet);
      }
    }
  }

  return analysis;
};

const updateAnalysisElementState = (analysis, element, state) => {
  let { forms, objects, parents } = analysis;
  forms = ensure(forms, {});
  objects = ensure(objects, {});
  parents = ensure(parents, {});

  element = ensure(element, 'no-element');
  if (element === 'no-element') { return analysis; }

  if (isScalar(element)) { element = ensure(objects[element], 'no-element'); }
  if (element === 'no-element') { return analysis; }

  state = ensure(state, 'no-state');
  if (state === 'no-state') { return analysis; }

  let keys = [];

  const walk = (e) => {
    let parent = ensure(objects[parents[e.id]], 'no-parent');
    keys.push(e.key);
    if (parent !== 'no-parent') { walk(parent); }
  };

  walk(element);

  let n = keys.length;
  if (n === 0) { return analysis; }
  forms = { ...forms };

  let currentForm = forms;

  for (;n--;) {
    currentForm[keys[n]] = {
      ...ensure(currentForm[keys[n]], {}),
      ...(n === 0 ? state : {})
    };

    currentForm = currentForm[keys[n]];
  }

  analysis = { ...analysis, forms };

  return analysis;
};

const setAnalysisPageEnabled = (analysis, page, callback) => {
  let { lastPageId, objects, pages, parents } = analysis;
  objects = ensure(objects, []);
  pages = ensure(pages, []);
  parents = ensure(parents, {});

  page = ensure(page, lastPageId);
  page = ensure(page, 'no-page');
  if (page === 'no-page') { return analysis; }

  if (!isArray(page)) { page = [page]; }

  let failedValidation = false;
  let idSet = page.map((p) => {
    if (failedValidation) { return; }
    if (isScalar(p)) { p = ensure(objects[p], 'no-page'); }
    if (p === 'no-page') {
      failedValidation = true;
      return;
    }

    return [p.id, true];
  });
  if (failedValidation) { return analysis; }

  if (idSet.length) {
    idSet = idSet.reduce(objectReduce, {});
    let changed = false;
    let newObjects = Object.values(objects).map((obj) => {
      if (idSet[obj.id]) {
        let newEnabledValue = callback(obj);
        if (obj.enabled !== newEnabledValue) {
          changed = true;
          obj = { ...obj, enabled: newEnabledValue };
        }
      }
      return [obj.id, obj];
    });

    if (changed) {
      analysis = { ...analysis, objects: newObjects.reduce(objectReduce, {}) };
    }
  }

  return analysis;
};

const enableAnalysisPage = (analysis, page) => (
  setAnalysisPageEnabled(analysis, page, () => true)
);

const disableAnalysisPage = (analysis, page) => (
  setAnalysisPageEnabled(analysis, page, () => false)
);

const toggleAnalysisPage = (analysis, page) => (
  setAnalysisPageEnabled(analysis, page, (p) => !p.enabled)
);

const setCurrentAnalysisPage = (analysis, page) => {
  let { currentPage, lastPageId, objects } = analysis;

  page = ensure(page, lastPageId);
  page = ensure(page, 'no-page');
  if (page === 'no-page') { return analysis; }
  if (isScalar(page)) { page = ensure(objects[page], 'no-page'); }
  if (page === 'no-page') { return analysis; }

  if (currentPage !== page.id) {
    analysis = { ...analysis, currentPage: page.id };
  }

  return analysis;
};

const setCurrentAnalysisPageByKey = (analysis, key) => {
  let { currentPage, objects, pages } = analysis;
  objects = ensure(objects, []);
  pages = ensure(pages, []);

  key = ensure(key, 'no-key');
  if (key === 'no-key') { return analysis; }

  let page;
  pages.some((pageId) => {
    let p = objects[pageId];
    let found = (p.key === key);
    if (found) { page = p; }
    return found;
  });

  return setCurrentAnalysisPage(analysis, page);
};

const analysis = (state = {}, action) => {
  const { type } = action;
  if (type === ACTION_TYPES.ADD_ANALYSIS_ELEMENT) {
    const { element, parent } = action;
    state = addAnalysisElement(state, element, parent);
  } else if (type === ACTION_TYPES.ADD_ANALYSIS_PAGE) {
    const { page } = action;
    state = addAnalysisPage(state, page);
  } else if (type === ACTION_TYPES.DISABLE_ANALYSIS_PAGE) {
    const { page } = action;
    state = disableAnalysisPage(state, page);
  } else if (type === ACTION_TYPES.ENABLE_ANALYSIS_PAGE) {
    const { page } = action;
    state = enableAnalysisPage(state, page);
  } else if (type === ACTION_TYPES.REMOVE_ANALYSIS_ELEMENT) {
    const { element } = action;
    state = removeAnalysisElement(state, element);
  } else if (type === ACTION_TYPES.REMOVE_ANALYSIS_PAGE) {
    const { key, page } = action;
    if (!isUndefined(key)) {
      state = removeAnalysisPageByKey(state, key);
      if (!isUndefined(page)) {
        state = removeAnalysisPage(state, page);
      }
    } else {
      state = removeAnalysisPage(state, page);
    }
  } else if (type === ACTION_TYPES.SET_CURRENT_ANALYSIS_PAGE) {
    const { key, page } = action;
    if (!isUndefined(key)) {
      state = setCurrentAnalysisPageByKey(state, key);
    } else {
      state = setCurrentAnalysisPage(state, page);
    }
  } else if (type === ACTION_TYPES.TOGGLE_ANALYSIS_PAGE) {
    const { page } = action;
    state = toggleAnalysisPage(state, page);
  } else if (type === ACTION_TYPES.TRUNCATE_ANALYSIS_PAGES) {
    const { count, clear, disable, remove } = action;
    state = truncateAnalysisPages(state, count, { clear, disable, remove });
  } else if (type === ACTION_TYPES.UPDATE_ANALYSIS_ELEMENT_STATE) {
    const { element, state: newState } = action;
    state = updateAnalysisElementState(state, element, newState);
  }

  return state;
};

export default analysis;
