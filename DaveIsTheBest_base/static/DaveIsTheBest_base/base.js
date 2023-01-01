let header_collapsed = true;

function header_expand_collapse(){
  let content = document.getElementById('header_expansion');
  if (header_collapsed){
    content.style.height = (content.scrollHeight) + "px";
    content.addEventListener('transitionend', function(e) {
      content.removeEventListener('transitionend', arguments.callee);
      content.style.height = "auto";
    });

  }else{
    content.style.height = content.scrollHeight + "px";
    setTimeout(function(){
      content.style.height = "0px";
    },20);

    content.style.height

  }
  header_collapsed = !header_collapsed;
}

function show_hide_replies(parent_comment_id,n) {
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

function show_hide_reply_form(parent_comment_id) {
  let form = document.getElementById(`show_hide_reply_form_${parent_comment_id}`);

  if (form.style.display == "none") {

    form.style.display = "block";

  } else if (form.style.display == "block") {

    form.style.display = "none";

  }
}