import { compose } from '../utils/reducer';
import objectReduce from '../utils/object-reduce';

import { isArray, isUndefined } from 'lodash';

const allocateId = (allocator = {}) => {
  let { maxId, freeList } = allocator;
  if (isUndefined(maxId)) { maxId = -1; }
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

const analysisReducer = compose({
  addPage (state, action) {
    let { page } = action;
    let { idAllocator, pages } = state;
    pages = pages || [];

    idAllocator = allocateId(idAllocator);
    let { id } = idAllocator;

    pages = [
      ...pages,
      { ...page, id, elements: [] }
    ];

    return {
      ...state,
      idAllocator,
      lastPageId: id,
      pages
    };
  },

  removePage (state, action) {
    let { id, form } = action;
    let predicates = [];

    if (!isUndefined(id)) {
      if (!isArray(id)) { id = [id]; }
      predicates.push((page) => id.indexOf(page.id) >= 0);
    }

    if (!isUndefined(form)) {
      if (!isArray(form)) { form = [form]; }
      predicates.push((page) => form.indexOf(page.form) >= 0);
    }

    let freedIds = [];
    let freedForms = {};

    const predicate = (page) => {
      let result = predicates.every((P) => !P(page));

      /* an a side-effect, count this page towards the form counts */
      let { form } = page;
      freedForms[form] = (freedForms[form] || 0) + Number(result);

      if (!result) {
        /* as a side-effect, record the ids that need to be freed */
        freedIds = [
          ...freedIds,
          page.id,
          ...page.elements.map(({ id }) => id)
        ];
      }

      return result;
    };

    let { pages } = state;
    pages = pages.filter(predicate);

    /* if some ids got freed, return them to the allocator */
    if (freedIds.length) {
      let idAllocator = returnId(freedIds, state.idAllocator);
      state = { ...state, pages, idAllocator };
    }

    /* if a form no longer has any pages referencing it, clear the form */
    freedForms = new Set(
      Object.entries(freedForms)
        .filter(([ , count]) => !count)
        .map(([form, ]) => form)
    );

    if (freedForms.size) {
      let { forms } = state;
      forms = (
        Object.entries(forms || {})
          .filter(([form, ]) => !freedForms.has(form))
          .reduce(objectReduce, {})
      );
      state = { ...state, forms };
    }

    return state;
  },

  addElement (state, action) {
    let { pageId, element } = action;

    if (isUndefined(pageId)) {
      ({ lastPageId: pageId } = state);
    }

    if (isUndefined(pageId)) /* (still) */ { return state; }

    let { pages } = state;

    let pageModified = false;

    pages = pages.map((page) => {
      if (page.id === pageId) {
        if (isUndefined(element.id)) {
          let idAllocator = allocateId(state.idAllocator);
          element.id = idAllocator.id;
          state = { ...state, idAllocator };
        }

        page = {
          ...page,
          elements: [
            ...page.elements,
            element
          ]
        };

        pageModified = true;
      }

      return page;
    });

    if (pageModified) {
      state = { ...state, pages };
    }

    return state;
  },

  removeElement (state, action) {
    let { pageId, id } = action;

    if (isUndefined(pageId)) {
      ({ lastPageId: pageId } = state);
    }

    if (isUndefined(pageId)) /* (still) */ { return state; }

    let { pages } = state;

    let pageModified = false;

    pages = pages.map((page) => {
      if (page.id === pageId) {
        page = {
          ...page,
          elements: page.elements.filter(({ id: _id }) => {
            let result = (_id !== id);
            if (!result) { pageModified = true; }
            return result;
          })
        };
      }

      return page;
    });

    if (pageModified) {
      state = {
        ...state,
        pages,
        idAllocator: returnId(id, state.idAllocator)
      };
    }

    return state;
  },

  setForm (state, action) {
    let { name: formKey, key, value } = action;

    let forms = state.forms || {};
    let form = forms[formKey] || {};
    let valueChanged = (value !== form[key]);

    if (valueChanged) {
      state = { ...state };
      state.forms = { ...(state.forms || {}) };
      state.forms[formKey] = { ...(state.forms[formKey] || {}) };
      state.forms[formKey][key] = value;
    }

    return state;
  }
}).defaultState({});

export default analysisReducer;
