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