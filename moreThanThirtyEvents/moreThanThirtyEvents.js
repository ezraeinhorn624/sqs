var currentUrl = window.location.href;
var nextUrl = undefined;
var stop = false;
const element = document.querySelector(".sqs-events-collection-list");
window.addEventListener("scroll", onScroll);

function getNextUrl(data) {
  nextUrl = undefined;
  stop = true;
  const pagination = data["pagination"];
  if (pagination && pagination["nextPage"]) {
    const myNextUrl = pagination["nextPageUrl"];
    nextUrl = window.location.origin.concat(myNextUrl);
    console.log("Updating nextUrl: ".concat(nextUrl));
    stop = false;
  }
}

async function onScroll(event) {
  window.removeEventListener("scroll", onScroll);
  var position = element.getBoundingClientRect();

  // detecting if bottom of element is visible
  if (position.bottom <= window.innerHeight && !stop) {
    console.log("Fetching older events...");
    // If we haven't yet fetched a page, then we need the current json
    if (!nextUrl) {
      const response = await fetch(
        currentUrl.includes("?")
          ? currentUrl.concat("&format=json")
          : currentUrl.concat("?format=json"),
      ); // fetch the current page
      const data = await response.json();
      getNextUrl(data);
    }
    // If we have a nextUrl to fetch...
    if (nextUrl) {
      console.log("Getting nextUrl: ".concat(nextUrl));
      const response = await $.get(nextUrl);
      const newDoc = $.parseHTML(response);
      $.each(newDoc, function (i, el) {
        if (el.nodeType == 1 && el.id == "siteWrapper") {
          // ELEMENT_NODE
          console.log("Found relevant item");
          const relevant = $(el).find(".sqs-events-collection-list article");
          $(".sqs-events-collection-list .eventlist").append(relevant);
        }
      });
      currentUrl = nextUrl;
      const nextJson = await fetch(nextUrl.concat("&format=json"));
      const data = await nextJson.json();
      getNextUrl(data);
    }
  }
  window.addEventListener("scroll", onScroll);
}
