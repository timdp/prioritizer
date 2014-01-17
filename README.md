Prioritizer
===========

A simple Web application to order a set of strings to your liking.

Usage
-----

Take a look at [this demo](http://timdp.github.com/prioritizer/). Your choice
won't be saved, but you'll be able to try out the frontend application.

To enable saving, you need to combine this code with your own (simple) REST
backend. A sample implementation in PHP is included as `api.php`. To write
your own, either extend that one or proceed as follows:

1. Write a REST backend in PHP, Python, Ruby, Node.js, or whatever.
    - On `GET`, it should return a JSON document consisting of:
        - `options`: an array of strings, representing the available options.
        - `order`: the user's last choice, if any. An array of integers, in
          which `1` represents the first element from `options`, `2` the
          second, etc.
    - On `POST`, it should store the user's choice and return a JSON document.
      The user's choice is passed as `order`, containing a comma-delimited
      list of integers. If it was successfully stored, the JSON document
      should contain the key `success` with a true value.
2. Make the REST backend available at a public URL.
3. Edit `index.html` and change `api.php` to the URL of your REST backend,
   so the application knows where to look.

Includes
--------

- [MooTools](http://mootools.net/) Core 1.4.5
  via
  [Google Hosted Libraries](https://developers.google.com/speed/libraries/devguide)
- MooTools More 1.4.0.1: Drag.Move, Element.Measure, and Class.Refactor
- [This patch](http://stackoverflow.com/questions/7588576/drag-with-mootools-on-mobile)
  to enable touch support

Compatibility
-------------

Any modern web browser, or even IE8, should do.

Limitations
-----------

A lot of them. Feel free to fork.

Author
------

[Tim De Pauw](http://pwnt.be/)

License
-------

Copyright &copy; 2013 Tim De Pauw

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
