# personalized-feed-stub

A stub of a Livefyre-powered Web Component that renders a personalized feed of social activities based on topics you follow in Livefyre.

To use this, you must do three things:

1. Construct a PersonalizedNewsFeed object by using the constructor exported from this module.
2. Implement the `.renderActivity` method, which will be passed each [activitystrea.ms]() Activity sent down from Livefyre's API. It should return an HTMLElement that renders the Activity (or falsy to skip).
3. After completing a Livefyre Single Sign On integration, pass the currently logged-in user's token to the `.setToken` method.

## Importing

You are free to fork this library or host it somewhere of your choosing. If that sounds tedious, you can also use [Livefyre.js](https://github.com/Livefyre/Livefyre.js) to import a pinned version. The below examples will use this method.

## Example

```html
<div id="element-the-feed-should-be-in"></div>
<script src="https://cdn.livefyre.com/Livefyre.js"></script>
<script>
// pinning to major version 0. You can be more specific if you like
// e.g. personalized-feed-stub#0.0.0-pre.0
Livefyre.require(['personalized-feed-stub#0'], function (PersonalizedNewsFeed) {
    // 1. Construct a PersonalizedNewsFeed
    var feed = new PersonalizedNewsFeed({
        el: document.getElementById('element-the-feed-should-be-in')
    });
    // 2. Implement .renderActivity
    feed.renderActivity = function (activity) {
        // nerd-mode implementation
        // this will show the raw JSON of each activity
        var el = document.createElement('pre');
        el.appendChild(
            document.createTextNode(
                JSON.stringify(activity, null, '  ')));
        return el;
    };
    // 3. Call .setToken whenever a user logs into your auth system
    // bring your own `auth`
    auth.on('login.livefyre', function (user) {
        var token = user.get('token');
        feed.setToken(token);
    });
});
</script>
```

See [index.html](./index.html) in this repo for a more elaborate implementation of `.renderActivity` that renders Livefyre Collection metadata whenever an activity whose `object.objectType === 'collection'` streams by. [index.css](./index.css) renders these CustomActivityElements.

## Advanced Features

In the above example, we passed `PersonalizedNewsFeed` an element to render in.

```html
<div id="element-the-feed-should-be-in"></div>
```

By adding children to your container element (and sometimes some corresponding styles) you can unlock some extra features.

### Custom ActivityList



```html
<div id="element-the-feed-should-be-in">
    <button data-show-more>Show More</button>
</div>
```

### Show More Button

Add an element with a `data-show-more` attribute, and whenever that element is clicked, the PersonalizedNewsFeed will fetch more activities from the server, render them, and append them to the list.

Other than the `data-show-more` attribute, you can add whatever 

```html
<div id="element-the-feed-should-be-in">
    <button data-show-more>Show More</button>
</div>
```
