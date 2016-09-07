# html-partials-compiler
Easily build a static html file by including html partials using npm.

## Background & Purpose
So, I've been using npm as a build tool, it's simplifies things not having to install grunt/gulp/etc. I was building a new multipage site and wanted to build the html files using reuseable partials to keep everything organized. The goal here, changing the common header in just one place, running the build and having the html files automatically updated. Seems like a basic idea, but I couldn't find an npm package to do just this, so I made one. I then wanted some very basic conditions avaliable, like if I'm building a `debug` build, I didn't want include a particular partial (in my case the google analytics code), so I added that in also. 

I hope that you find this a useful tool.

## Usage
Install via npm package manager
```
npm install html-partials-compiler -g
```
Command line:
```
$ html-partials-compiler --cond=comma,separated,list,of,conditions input.html
```
You can then pipe the output to another file (as is shwon in the examples below).

## Examples

### Basic
Simply include the files where you want them

File: `./partials/header.html`
```
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>My website</title>
</head>
```
File: `./partials/footer.html`
```
   <footer>
   &copy; <a href="mywebsite.example.com">My website</a>
   </footer>
```

File: `index.html`
```
<include src="./partials/header.html">
<body>
   <h1>Welcome to my website</h1>
   <p>Hello world, and welcome to my website.</p>
<include src="./partials/footer.html">
</body>
</html>
```

Command: `$ html-partials-compliler ./html/index.html > dist/index.html`

Compiled file: `dist/index.html`
```
<!DOCTYPE html>
<html>
<head>
   <meta charset="utf-8">
   <title>My website</title>
</head>
<body>
   <h1>Welcome to my website</h1>
   <p>Hello world, and welcome to my website.</p>
   <footer>
   &copy; <a href="mywebsite.example.com">My website</a>
   </footer>
</body>
</html>
```

See it's that easy. You can then run any other script you want on the built html file.
Also it's not limited to html. it will include any text based file, including js files, json files (can be great for data injection), etc.

### Conditionals
Conditionals are easy too. These are basically a yes/no set off passed in options.
Lets add a script for debug purposes:

File `./partials/debug.html`
```
<script type="text/javascript">
   console.log('Debug mode');
</script>
```

File: `index.html`
```
<include src="./partials/header.html">
<body>
   <h1>Welcome to my website</h1>
   <p>Hello world, and welcome to my website.</p>
<include src="./partials/footer.html">
<include src="./partials/debug.html" cond="debug">
</body>
</html>
```

Command: `$ html-partials-compliler --cond=debug ./html/index.html > dist/index_debug.html`

Compiled file: `dist/index_debug.html`
```
<!DOCTYPE html>
<html>
<head>
   <meta charset="utf-8">
   <title>My website</title>
</head>
<body>
   <h1>Welcome to my website</h1>
   <p>Hello world, and welcome to my website.</p>
   <footer>
   &copy; <a href="mywebsite.example.com">My website</a>
   </footer>
<script type="text/javascript">
   console.log('Debug mode');
</script>   
</body>
</html>
```

If you passed in a different param, the the debug condition would be skipped and the resulting `dist/index_debug.html` would look the same as the the first compiled `dist/index.html` file.

## Contributing, Help & Requests
If you you help, please feel free to create an issue or fork and make a PR. If you want to contribute, by all means, please make a fork and request a PR. If you want this for X task runner, then please feel free to write a wrapper for it. 

I consider this to be a finish product with only the need to fix any bugs that may arise. If you're looking for feature X, please make sure it is within the scope of this project. For example, I'm _not_ going to add a mimify option since there are already great packages for that and you can simply pass them the output of this package.
