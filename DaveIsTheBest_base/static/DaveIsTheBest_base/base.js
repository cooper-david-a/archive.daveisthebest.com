let header_collapsed = true;
let comments = {};
let threadIds = [];
let currentCommentPage = 1;
let threadsPerPage = 10;
let comments_container = document.getElementById('comments_container');
const csrftoken = getCookie('csrftoken');

function header_expand_collapse() {
  let content = document.getElementById('header_expansion');
  if (header_collapsed) {
    content.style.height = (content.scrollHeight) + "px";
    content.addEventListener('transitionend', function (e) {
      content.removeEventListener('transitionend', arguments.callee);
      content.style.height = "auto";
    });

  } else {
    content.style.height = content.scrollHeight + "px";
    setTimeout(function () {
      content.style.height = "0px";
    }, 20);

    content.style.height

  }
  header_collapsed = !header_collapsed;
}


/*comments*/
async function getComments() {

  let latestComment = Object.keys(comments).reverse()[0];
  if (!latestComment) latestComment = 0;

  await fetch(window.location.origin + `/comments/?latest=${latestComment}`, { method: 'GET' })
    .then((res) => res.json())
    .then((data) => {
      if (latestComment>0) Object.entries(data.comments).forEach((reply) => comments[reply[1].parent_comment_id].reply_ids.unshift(reply[0]));
      comments = Object.fromEntries(Object.entries(comments).concat(Object.entries(data.comments)));      
      threadIds = Object.values(comments)
        .filter((comment) => comment.parent_comment_id === null)
        .map((comment) => comment.id)
        .reverse();
    })
    .catch((error) => console.log(error));
  
}

async function displayComments() {  
  comments_container.innerHTML = `<p><h3>Comments</h3></p> <p>${threadIds.length} Threads</p>`;
  let first = (currentCommentPage - 1) * threadsPerPage;
  let last = first + threadsPerPage;
  let commentsPage = threadIds.slice(first, last);
  commentsPage.forEach((comment_id) => createCommentDiv(comments[comment_id]));
  comments_container.append(renderCommentPagination());
}

function createCommentDiv(comment) {
  let now = new Date();
  let date_entered = new Date(comment.date_entered);
  let commenter_name = comment.commenter_name;
  let parent_comment_id = comment.parent_comment_id;
  if (!commenter_name) commenter_name = 'Anonomous';

  let commentDiv = document.createElement('div');
  commentDiv.id = `comment_card_${comment.id}`
  commentDiv.classList.add("existing_comment_card")
  commentDiv.innerHTML = `
    <p><em>${commenter_name}</em>, ${humanReadableDuration(now - date_entered)}</p>    
    <p class="comment_text">${comment.comment_text}</p>
    <div id="reply_btn_${comment.id}" class="reply_btn" onclick="showHideReplyForm(${comment.id})">Reply</div>    
  `

  let repliesDiv = document.createElement('div');
  repliesDiv.id = `comment_${comment.id}_replies`
  repliesDiv.classList.add("replies");
  repliesDiv.style.display = "none";
  commentDiv.append(repliesDiv);

  let show_hide_replies_button = document.createElement('div');
  show_hide_replies_button.id = 'show_hide_replies_button_' + comment.id;
  show_hide_replies_button.classList.add('show_hide_reply_btn');
  show_hide_replies_button.onclick = () => showHideReplies(comment.id, comment.reply_ids.length);

  switch (comment.reply_ids.length) {
    case 0:
      break;
    case 1:
      show_hide_replies_button.innerText = 'Show Reply';
      repliesDiv.before(show_hide_replies_button);
      break;
    default:
      show_hide_replies_button.innerText = 'Show Replies';
      repliesDiv.before(show_hide_replies_button);
      break;
  }

  if (!parent_comment_id) {
    parent = document.getElementById('comments_container');
  } else {
    parent = document.getElementById(`comment_${parent_comment_id}_replies`);
  }

  parent.append(commentDiv);

  if (comment.reply_ids) {
    comment.reply_ids.forEach((comment_id) => createCommentDiv(comments[comment_id]));
  }
}

function renderCommentPagination() {
  let nPages = Math.ceil(threadIds.length / threadsPerPage);
  let commentsPaginationDiv = document.createElement('div');
  commentsPaginationDiv.id = 'comments_pagination_div';

  if (nPages > 1) {    
    if (currentCommentPage > 1) {
      let previousCommentsPaginationButton = document.createElement('div');
    previousCommentsPaginationButton.id = 'previous_comments_pagination_button';
    previousCommentsPaginationButton.innerText = '<';
    previousCommentsPaginationButton.classList.add('pagination_button');
    previousCommentsPaginationButton.addEventListener('click', () => { currentCommentPage -= 1; displayComments() });
    commentsPaginationDiv.append(previousCommentsPaginationButton);
  }
  
  for (let i = 1; i < nPages+1; i++) {
    let commentsPaginationButton = document.createElement('div');
    commentsPaginationButton.id = 'comments_pagination_button_' + i;
    commentsPaginationButton.innerText = i;
    commentsPaginationButton.classList.add('pagination_button');
    if (i == currentCommentPage) commentsPaginationButton.classList.add('current_page_button');
    commentsPaginationButton.addEventListener('click', () => { currentCommentPage = i; displayComments() });
    commentsPaginationDiv.append(commentsPaginationButton);
  }

  if (currentCommentPage < nPages) {   
    let nextCommentsPaginationButton = document.createElement('div');
    nextCommentsPaginationButton.id = 'next_comments_pagination_button';
    nextCommentsPaginationButton.innerText = '>';
    nextCommentsPaginationButton.classList.add('pagination_button');
    nextCommentsPaginationButton.addEventListener('click', () => { currentCommentPage += 1; displayComments() });
    commentsPaginationDiv.append(nextCommentsPaginationButton);
  }
}

  commentsPaginationDiv.append('Threads per page: ');

  let threadsPerPageSelector = document.createElement('select');
  threadsPerPageSelector.id = 'threads_per_page_selector';
  let nOptions = Math.ceil(threadIds.length / 10);
  for (let i = 1; i < nOptions+1; i++){
    let option = document.createElement('option');
    option.text = Math.min(10 * i,threadIds.length);
    option.value = Math.min(10 * i, threadIds.length);
    threadsPerPageSelector.append(option);
  }
  threadsPerPageSelector.value = threadsPerPage;
  threadsPerPageSelector.addEventListener('change', (event) => { threadsPerPage = event.target.value; currentCommentPage = 1; displayComments() });
  commentsPaginationDiv.append(threadsPerPageSelector);


  return commentsPaginationDiv;

}

function humanReadableDuration(deltaT) {
  let minutes = Math.floor(deltaT / 1000 / 60);
  if (minutes <= 2) return 'just now';
  let hours = Math.floor(minutes / 60);
  if (hours <= 2) return `${minutes} minutes ago`;
  let days = Math.floor(hours / 24);
  if (days <= 1) return `${hours} hours ago`;
  let weeks = Math.floor(days / 7);
  if (weeks <= 1) return `${days} days ago`;
  let months = Math.floor(days / 30);
  if (months <= 1) return `${weeks} weeks ago`;
  let years = Math.floor(days / 365);
  if (years <= 1) return `${months} months ago`;
  return `${years} years ago`;
}

function showHideReplies(parent_comment_id, n) {
  let replies = document.getElementById(`comment_${parent_comment_id}_replies`);
  let show_hide_replies_button = document.getElementById(`show_hide_replies_button_${parent_comment_id}`);

  let button_text = n > 1 ? "Replies" : "Reply";

  if (replies.style.display == "none") {

    replies.style.display = "block";
    show_hide_replies_button.innerHTML = `Hide ${button_text}`;

  } else if (replies.style.display == "block") {

    replies.style.display = "none";
    show_hide_replies_button.innerHTML = `Show ${button_text}`;

  }
}

function showHideReplyForm(parent_comment_id) {
  if (!document.getElementById('comment_form_' + parent_comment_id)) {
    document.getElementById("reply_btn_" + parent_comment_id).after(renderCommentForm(parent_comment_id));
  } else {
    document.getElementById('comment_form_' + parent_comment_id).remove();
  }
}

function renderCommentForm(parent_comment_id) {
  if (!parent_comment_id) parent_comment_id = 0;
  let newForm = document.createElement('form');
  newForm.id = 'comment_form_' + parent_comment_id;
  newForm.classList.add('new_comment_form');
  newForm.method = "POST";
  newForm.action = window.location.origin + '/comments/';

  newForm.innerHTML = `<input type="hidden" name="parent_comment_id" value="${parent_comment_id}">
    <input type="hidden" name="csrfmiddlewaretoken" value="${csrftoken}">
    <p><input type="text" name="commenter_name" placeholder="Name (optional)"></p>
    <p><textarea name="comment_text"></textarea></p>
    <div id="post_comment_button_${parent_comment_id}" class="post_comment_btn" onclick="postComment(event,${parent_comment_id})">Post Comment</div>`

  return newForm
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

async function postComment(event) {
  let inputs = event.target.parentNode.elements;

  let comment = {
    parent_comment_id: inputs.parent_comment_id.value,
    commenter_name: inputs.commenter_name.value,
    comment_text: inputs.comment_text.value
  }

  await fetch(
    window.location.origin + '/comments/',
    {
      credentials: 'include',
      method: 'POST',
      mode: 'same-origin',
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
        'X-CSRFToken': csrftoken
      },
      body: JSON.stringify(comment)
    }
  )
    .then((res) => res.json())
    .then((msg) => { if (msg.auto_is_spam) addSpamMsg(comment.parent_comment_id) })
    .catch((error) => console.log(error))
  
  await getComments().then(displayComments);

  event.target.parentNode.reset();
}

function addSpamMsg(parent_comment_id) {
  form = document.getElementById('comment_form_' + parent_comment_id);

  msg = document.createElement('p');
  msg.id = 'spam_msg_' + parent_comment_id;
  msg.innerText = "Your comment was auto-marked as spam.  I'll review it manually sooner or later."
  form.append(msg);
}

function deleteSpamMsg(parent_comment_id) {  
  document.getElementById('spam_msg_' + parent_comment_id).remove();
}

comments_container.before(renderCommentForm());
getComments().then(displayComments);
setInterval(()=>getComments().then(displayComments),60000)