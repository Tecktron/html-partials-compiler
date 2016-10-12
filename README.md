# html-partials-compiler
Easily build a static html file by including html partials using npm.

This is open source software. Your help in any capacity, even a star, is greatly appreciated.

## Background & Purpose
So I've been using npm as a build tool as I find it simplifies things not having to install grunt/gulp/etc. I was building a new multipage site and wanted to build the base html files using reusable partials to keep everything organized. My goal here is to change the common header in just one place, running the build and having the base html files updated. Seems like a basic idea, but I couldn't find an npm package to do just this, so I made one. 
I then figured that wanted some very basic conditions available, like if I'm building a `debug` build, I didn't want to include a particular partial (in my case the google analytics code), so I added that feature in also. I also starting figuring that I wanted to inject some static content, but I wanted it minified it before hand in certain situations so I've also implemented that as a very basic, albeit functional, feature. 

Please note that this was not created as a runtime compiler. There are plenty of packages out there that do that sort of thing. This is a build tool and can actually be used on any text file. It's basically type of search and replace tool.

I hope that you find this a useful tool.

## Usage
Install as a global via npm
```
npm install html-partials-compiler -g
```

#### Command line:
```
$ html-partials-compiler --cond comma,separated,list,of,conditions input.html
```
You can then pipe the output to another file (as is shown in the examples).

#### In Your File:
In the html file (or any text file really), I decided to create a `<!partial>` tag. 
So far I've found this to be unique so I don't interfere with any other packages that you may be using on the javascript side (I noticed a few that use an `<include>` tag). I added in the extra <! as some editors complained about an unknown or unclosed tag without it and this side-stepped that validation. 
This tag will be replaced with the `src` you provide based on the `cond` if you have supplied any and first process by any `run` present.

```
<!partial src='./location/of/some/file.html' cond='optional' run='optional-parser' run-cond=`optional`>
```

#### Attribute details
    
- `src` - The location of the partial to include. This can be a relative path based on the location of the input file or a full path. If a partial doesn't contain an `src` or the file cannot be found, it will simply be removed.
- `cond` - An _optional_ attribute containing a comma separated list of conditions. See notes on cond below.
- `run` - An _optional_ attribute containing a command to run on the partial before replacement. See notes on run below.
- `run-cond` - An _optional_ attribute containing a comma separated list of conditions in which the run command will be run. See notes on run below

##### Notes on cond
The `cond` works by converting the list of conditions passed in to an array. This is also true for the attribute in the `<!partial>`. The arrays are then matched against each other for a common value and if found, the partial will be included. If not, it will be removed.
Here's an example of using a cond, passing in: `--cond debug` will render `<!partial src='...' cond='debug,staging'>`, however, `<!partial src='...' cond='prod,staging'>` would just be removed since the `debug` cond is not fulfilled.

If no `--cond` parameters are passed in, all `cond` attributes will be ignored and all partials will be included.
To have no conditionals included, simply pass in a value that has no matching partials and they will all be skipped.

##### Notes on run
The `run` option is _extremely_ simple and should only be used by other build tools (this one included) that output to the stdout. This works by simply appending a space and the partial filename, as full path, to the command. For example `<!partial src="./example.json" run="json-minify">` will generate the command `json-minify /some/path/to/example.json` This command is then run as a shell command (`child_process.execSync`) and the expected text output is captured. Since this is done in a synchronous manner (see todos), it may hold up further operations if the command takes a long time to process
 
The `run-cond` works the same was as the `cond` in how it's parsed (array against array), but is used only to determine if the run command will be run. If no `run-cond` is specified, the run command will always be executed if the partial is to be included. As with `cond` if no `--cond` param is passed in, `run` will always be executed.

An example of using this would be wanting to inject a piece of json or a svg into your html, but you want it minified before replacement. Please see the example below for more on this.
I would not suggest running this on every partial in order to try and minify your html, I would recommend you pass the completed html to a minifier once it's been built.

#### Additional Considerations

- Order is important, `cond` works before the `run` command, so if a partial is not to be included, the `run` command will not happen, even if the `run-cond` specify otherwise.
- To save time, partials are replaced globally using search and replace for the exact `<!partial>` tag (with matching attributed) to the exact built partial string. 
- If you add in a partial containing partials, those will also end up be parsed, however the base path will still be that of the original input file, so be careful with your relative paths, if you choose to use this pattern (see the todo section below).
- Avoid including a partial within itself. You will end up in a recursive loop.

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
<!partial src="./partials/header.html">
<body>
   <h1>Welcome to my website</h1>
   <p>Hello world, and welcome to my website.</p>
<!partial src="./partials/footer.html">
</body>
</html>
```

Command: `$ html-partials-compiler ./html/index.html > ./dist/index.html`

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
<!partial src="./partials/header.html">
<body>
   <h1>Welcome to my website</h1>
   <!partial src="./partials/prod_content.html" cond="prod">
   <p>Hello world, and welcome to my website.</p>
<!partial src="./partials/footer.html">
<!partial src="./partials/debug.html" cond="debug">
</body>
</html>
```

Command: `$ html-partials-compiler --cond debug ./html/index.html > ./dist/index_debug.html`

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

As you can see, the `cond="prod"` partial was removed while the `cond="debug"` was replaced with our partial.

### Commands

Inject a json blob into a script, minified for production. This demo uses the [json-minify package](https://www.npmjs.com/package/json-minify).

File: `./settings/homepage.json`
```
{
    "message": "Some useful settings",
    "selected": [
        "one",
        "two",
        "four"
    ]
}
```

File: `./html/index.html`
```
<!partial src="./partials/header.html">
<body>
   <h1>Welcome to my website</h1>   
   <p>Hello world, and welcome to my website.</p>
<!partial src="./partials/footer.html">
<!partial src="./partials/debug.html" cond="debug">
<script type="application/json" id="homepage-settings">
<!partial src="./settings/homepage.json" run="json-minify" run-cond="prod">
</script>
</body>
</html>
```

Command: `$ html-partials-compiler --cond prod ./html/index.html > ./dist/index.html`

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

<script type="application/json" id="homepage-settings">
{"message":"Some useful settings","selected":["one","two","four"]}
</script>
</body>
</html>
```

As you can see the partial was included and run though the json-minify package.

## Contributing, Help & Requests
If you need help, please feel free to create an issue or fork and make a PR. If you want to contribute, by all means, please make a fork and request a PR. If you want this for X task runner, then please feel free to write a wrapper for it. 

If you're looking for feature X, please make sure it is within the scope of this project. For example, I'm _not_ going to add a mimify option since there are already great packages for that and you can simply pass them the output of this package.

#### Todos

* [ ] _Annotate code_ - Code could use some comments.

* [ ] _Add in path recursion_ - As of current, in order to perform recursion, you need to either string the commands or adjust the paths to be that of the top file. It would be a nice feature to be able to have the app parse the partials on their level.

* [ ] _Caching_ - possibly caching the partials during execution so they don't need to be re-read or re-executed.

* [ ] _Performance enhancements_ - I wrote this in a hasty way to get it done and be useful for my need. There are many ways to do things faster, better and even asynchronously.
