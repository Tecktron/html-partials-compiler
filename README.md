# html-partials-compiler
Easily build a static html file by including html partials using npm.

This is open source software. Your help, in any capacity, is greatly appreciated.

## Background & Purpose
So, I've been using npm as a build tool, it's simplifies things not having to install grunt/gulp/etc. I was building a new multipage site and wanted to build the html files using reuseable partials to keep everything organized. The goal here, changing the common header in just one place, running the build and having the html files automatically updated. Seems like a basic idea, but I couldn't find an npm package to do just this, so I made one. I then wanted some very basic conditions avaliable, like if I'm building a `debug` build, I didn't want include a particular partial (in my case the google analytics code), so I added that in also.

Please note that this was not created as a runtime compiler. There are plenty of packages out there that do that sort of thing. This is a build tool and can actually be used on any text file. It's basically type of search and replace tool.

I hope that you find this a useful tool.

## Usage
Install via npm package manager
```
npm install html-partials-compiler -g
```
Command line:
```
$ html-partials-compiler --cond comma,separated,list,of,conditions input.html
```
You can then pipe the output to another file (as is shown in the examples below).

In the html file (or any text file really), use a `<partial>` tag. It will then be replaced with the `src` you provide based on the `cond` if you have supplied one.
```
<partial src='./location/of/some/file.html' cond='optional'>
```

#### Attribute details
    
- `src` - The location of the partial to include. This can be a relative path based on the location of the input file or a full path. If a partial doesn't contain an src, it will simply be removed.
- `cond` - An _optional_ comma separated list of conditionals. The items in cond are used in a logical OR fashion. Basically, the conditions are converted to an array, and if a value in one array is in the value of the other, it will be included.

Here's an example of using a cond, using passing in: `cond debug` will render `<partial src='...' cond='debug,staging'>`, 
however, `<partial src='...' cond='prod,staging'>` would just be removed since the debug cond is not fulfilled.

If no cond parameters are pass in, all cond params will be ignored and all partials will be included.

If the `src` file cannot be found the partial will simply be removed.

#### Notes

- If you add in a partial with partials, those will also be parsed, however the base path will still be that of the input file, so be careful with your relative paths, if you choose to use this pattern (see the todo section below).
- Avoid including a file within itself. You will end up in a recursive loop or it.

## Examples

### Basic
Simply include the files where you want them

File: `./html/partials/header.html`
```
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>My website</title>
</head>
```
File: `./html/partials/footer.html`
```
   <footer>
   &copy; <a href="mywebsite.example.com">My website</a>
   </footer>
```

File: `./html/index.html`
```
<partial src="./partials/header.html">
<body>
   <h1>Welcome to my website</h1>
   <p>Hello world, and welcome to my website.</p>
<partial src="./partials/footer.html">
</body>
</html>
```

Command: `$ html-partials-compliler ./html/index.html > ./dist/index.html`

Compiled file: `./dist/index.html`
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

File `./html/partials/debug.html`
```
<script type="text/javascript">
   console.log('Debug mode');
</script>
```

File: `./html/index.html`
```
<partial src="./partials/header.html">
<body>
   <h1>Welcome to my website</h1>
   <partial src="./partials/prod_content.html" cond="prod">
   <p>Hello world, and welcome to my website.</p>
<partial src="./partials/footer.html">
<partial src="./partials/debug.html" cond="debug">
</body>
</html>
```

Command: `$ html-partials-compliler --cond debug ./html/index.html > dist/index_debug.html`

Compiled file: `./dist/index_debug.html`
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
If you need help, please feel free to create an issue or fork and make a PR. If you want to contribute, by all means, please make a fork and request a PR. If you want this for X task runner, then please feel free to write a wrapper for it. 

If you're looking for feature X, please make sure it is within the scope of this project. For example, I'm _not_ going to add a mimify option since there are already great packages for that and you can simply pass them the output of this package.

#### Todos

* [ ] _Add in path recursion_ - As of current, in order to perform recursion, you need to either string the commands or adjust the paths to be that of the top file. It would be a nice feature to be able to have the app parse the partials on their level.

* [ ] _Performance enhancements_ - I wrote this in a hasty way to get it done and be useful for my need. There are many ways to do things faster, better and even asynchronously.
