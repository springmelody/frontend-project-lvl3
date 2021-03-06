import onChange from 'on-change';
import i18next from 'i18next';

export default (state, elements) => {
  const {
    input,
    submitButton,
    feedbackContainer,
    modal,
  } = elements;

  const renderFeeds = (feeds) => {
    const fragment = document.createDocumentFragment();
    const feedsContainer = document.querySelector('.feeds');
    const feedsTitle = document.createElement('h2');
    feedsTitle.textContent = i18next.t('feedsTitle');
    fragment.appendChild(feedsTitle);

    const list = document.createElement('ul');
    list.setAttribute('class', 'list-group mb-5');
    feeds.forEach((el) => {
      const item = document.createElement('li');
      item.setAttribute('class', 'list-group-item');
      const itemTitle = document.createElement('h3');
      itemTitle.textContent = el.title;
      item.appendChild(itemTitle);
      const itemDescEl = document.createElement('p');
      itemDescEl.textContent = el.description;
      item.appendChild(itemDescEl);
      list.appendChild(item);
    });

    fragment.appendChild(list);
    feedsContainer.innerHTML = '';
    feedsContainer.appendChild(fragment);
  };

  const renderPosts = (watchedState) => {
    const fragment = document.createDocumentFragment();
    const postsContainer = document.querySelector('.posts');
    const postsTitle = document.createElement('h2');
    postsTitle.textContent = i18next.t('postsTitle');
    fragment.appendChild(postsTitle);
    const postsList = watchedState.rssContent.posts;
    const listEl = document.createElement('ul');
    listEl.setAttribute('class', 'list-group');
    postsList.forEach((post) => {
      const itemEL = document.createElement('li');
      itemEL.setAttribute('class', 'list-group-item d-flex justify-content-between align-items-start');
      const itemElLink = document.createElement('a');
      itemElLink.setAttribute('href', post.itemLink);
      const className = watchedState.viewedPosts.has(post.id) ? 'font-weight-normal' : 'font-weight-bold';
      itemElLink.setAttribute('class', className);
      itemElLink.setAttribute('data-id', post.id);
      itemElLink.textContent = post.itemTitle;
      const itemElBtn = document.createElement('button');
      itemElBtn.setAttribute('class', 'btn btn-primary btn-sm');
      itemElBtn.setAttribute('data-toggle', 'modal');
      itemElBtn.setAttribute('data-target', '#modal');
      itemElBtn.setAttribute('data-id', post.id);
      itemElBtn.textContent = i18next.t('previewBtn');
      itemEL.appendChild(itemElLink);
      itemEL.appendChild(itemElBtn);
      listEl.appendChild(itemEL);
    });

    fragment.appendChild(listEl);
    postsContainer.innerHTML = '';
    postsContainer.appendChild(fragment);
  };

  const handleProcessState = (watchedState) => {
    switch (watchedState.formProcessState) {
      case 'loading':
        submitButton.disabled = true;
        input.setAttribute('readonly', 'true');
        break;
      case 'idle':
        submitButton.disabled = false;
        input.removeAttribute('readonly');
        feedbackContainer.classList.remove('text-danger');
        feedbackContainer.classList.add('text-success');
        feedbackContainer.textContent = i18next.t('loaded');
        input.value = '';
        input.focus();
        break;
      case 'failed':
        submitButton.disabled = false;
        input.removeAttribute('readonly');
        feedbackContainer.classList.remove('text-success');
        feedbackContainer.classList.add('text-danger');
        input.classList.add('is-invalid');
        feedbackContainer.textContent = i18next.t(`errorMessages.${watchedState.form.errorType}`);
        break;
      default:
        throw new Error(`Unknown formProcessState: ${watchedState.formProcessState}`);
    }
  };

  const handleValid = (watchedState) => {
    if (watchedState.form.valid === 'valid') {
      input.classList.remove('is-invalid');
    } else if (watchedState.form.valid === 'invalid') {
      input.classList.add('is-invalid');
      feedbackContainer.classList.remove('text-success');
      feedbackContainer.classList.add('text-danger');
      const { key } = watchedState.form.errorType;
      feedbackContainer.textContent = i18next.t(`errorMessages.${key}`);
    }
  };

  const renderModal = (watchedState) => {
    const { description, link, title } = watchedState.modal;
    const modalTitle = modal.querySelector('.modal-title');
    modalTitle.textContent = title;
    const modalBody = modal.querySelector('.modal-body');
    modalBody.textContent = description;
    const modalLink = modal.querySelector('.full-article');
    modalLink.textContent = i18next.t('modalLink');
    modalLink.href = link;
    const modalCloseBtn = modal.querySelector('button.btn');
    modalCloseBtn.textContent = i18next.t('closeBtn');
  };

  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'formProcessState':
        handleProcessState(watchedState);
        break;
      case 'form.valid':
        handleValid(watchedState);
        break;
      case 'rssContent.posts':
        renderPosts(watchedState);
        break;
      case 'rssContent.feeds':
        renderFeeds(watchedState.rssContent.feeds);
        break;
      case 'viewedPosts':
        renderPosts(watchedState);
        break;
      case 'modal':
        renderModal(watchedState);
        break;
      default:
        break;
    }
  });

  return watchedState;
};
