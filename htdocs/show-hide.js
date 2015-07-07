    function setDisplay(selectors, value) {
      var divs = document.querySelectorAll(selectors);
      for (var i = 0; i < divs.length; i++) {
        divs[i].style.display = value;
      }
    }

    function show(id) {
      setDisplay('.showable', 'none');
      setDisplay('.clicktoshow', 'block');
      document.getElementById(id).style.display = 'block';
      document.getElementById(id + '-click').style.display = 'none';
    }

    function showAll() {
      setDisplay('.showable', 'block');
      setDisplay('.clicktoshow', 'none');
    }

    function hideAll() {
      setDisplay('.showable', 'none');
      setDisplay('.clicktoshow', 'block');
    }
