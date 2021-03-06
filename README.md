# Livefyre Personalized Application Stub

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

See [index.html](./index.html) in this repo for a more elaborate implementation of `.renderActivity` that renders Livefyre Collection metadata whenever an activity whose `object.objectType === 'collection'` streams by. [index.css](./index.css) styles these CustomActivityElements.

## API

This package exports a constructor that takes the following options

* el - optional - An existing HTMLElement to render in
* environment - 'production' (default), 'uat', or 'qa' - The Livefyre Environment to connect to.

Example:
```javascript
var myFeed = new PersonalizedNewsFeed({
    el: document.getElementById('my-element'),
    environment: 'uat'
});
```

## Advanced Features

In the above example, we passed `PersonalizedNewsFeed` an element to render in.

```html
<div id="element-the-feed-should-be-in"></div>
```

By adding children to your container element (and sometimes some corresponding styles) you can unlock some extra features.

### Show More Button

Add an element with a `data-show-more` attribute, and whenever that element is clicked, the PersonalizedNewsFeed will fetch more activities from the server, render them, and append them to the list.

Other than the `data-show-more` attribute, you can add whatever other attributes or classes you desire.

```html
<div id="element-the-feed-should-be-in">
    <button data-show-more>Show More</button>
</div>
```

### Custom Activity List

You may similarly want more HTML control over the list that contains each rendered activity. If the element you pass to the `PersonalizedNewsFeed` constructor has a child whose `role` attribute is `list`, rendered activities will be rendered in that element. Otherwise, a list element will be created and appended to the feed for you.

```html
<div id="element-the-feed-should-be-in">
    <div role="list" class="my-custom-activity-list"></div>
    <button data-show-more>Show More</button>
</div>
```

### Loading Screen

PersonalizedNewsFeed will add a `data-loading` attribute to its HTMLElement upon construction, and will remove it once the initial activities have been fetched, rendered, and appended to the feed element.

You can use this attribute to show a loading screen until there are activities to show off to the user.

```html
<div id="element-the-feed-should-be-in"
     class="custom-activity-feed"
     data-loading>
    <div role="progressbar">Your personalized news feed is loading...</div>
    <div role="list" class="my-custom-activity-list"></div>
    <button data-show-more>Show More</button>
</div>
<style>
.custom-activity-feed[data-loading] > *:not([role="progressbar"]),
.custom-activity-feed > [role="progressbar"] {
    display: none;
}
.custom-activity-feed[data-loading] > [role="progressbar"] {
    display: block;
}
</style>
```
