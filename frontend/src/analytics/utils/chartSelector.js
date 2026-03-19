export function chooseChart(type) {

  switch(type){

    case "distribution":
      return "pie";

    case "trend":
      return "line";

    case "comparison":
      return "bar";

    case "ranking":
      return "horizontalBar";

    default:
      return "bar";
  }

}