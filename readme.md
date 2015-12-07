## Fout-B-Gone

Repo based on now [non-existing fout-b-gone library](http://app.webink.com/fout-b-gone/) by WebInk mentioned in this [article](http://www.paulirish.com/2009/fighting-the-font-face-fout/) by Paul Irish.

Fout-B-Gone addresses the flash of unstyled type (FOUT) problem in Firefox 3.5/3.6 and Internet Explorer 7–9.

### Installation
Available through npm or bower or just install 

```bash
bower install --save foutbgone
npm install --save foutbgone
```

### Usage
Fout-B-Gone works the best if added in the document head just after adding CSS.

>As of version 2.0 the library now supports [UMD](https://github.com/umdjs/umd). That inlcudes breaking changes for v1.0 users. Now foutbgone returns a class instead of adding a global class instance

```javascript
// CommonJS - ES5
var FoutBGone = require('foutbgone');

// CommonJS - ES6
import FoutBGone from 'foutbgone';

// AMD
define(['foutbgone'], function(FoutBGone) {
    // ...
});

// Plain-old script files
<script src="path/to/foutbgone.js"></script>
```

### Example

`index.html`

```html
<!DOCTYPE html>
<html>
<head>
    <!-- site meta data -->
    <link rel="stylesheet" type="text/css" href="css/site.css">
    <!-- Include head.js which imports and initiates a FoutBGone instance -->
    <script src="js/head.js"></script>
</head>
<body>

</body>
</html>
```

`js/head.js`

```javascript
import FoutBGone from 'foutbgone';

const foutBGone = new FoutBGone();
foutBGone.hideFOUT('asap');
```

### Author
[Renārs Vilnis](https://twitter.com/RenarsVilnis)

### License
Fout-B-Gone is MIT licensed.
