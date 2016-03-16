# kea-rails-loader

This is an experimental module. Do not use with anything serious.

Given a rails controller that includes `Kea::Controller` from `kea-rails` like this:

```ruby
# at /app/scenes/search/result/reputation.rb
class Scenes::Search::Result::Reputation < ApplicationController
  include Kea::Controller

  def reputation
    @user = User.find(params[:id])

    render json: {
      id: @user.id,
      name: @user.full_name,
      reputation: @user.reputation
    }
  end
end
```

Import and use it through webpack like this:

```js
// at /app/scenes/search/result/reputation.js
import endpoint from './reputation.rb'

endpoint.reputation({ id: this.props.id }).then((response) => {
  console.log(response.name)
})
```

In your webpack config:

```js
{
  module: {
    loaders: [
      { test: /\.rb$/, loader: 'kea-rails-loader' }
    ]
  }
}
```

Optional arguments for loader with defaults: `?camelize=true&engine=$`

`camelize` - should the function names be camelized? `endpoint.add_favourite()` gets turned into `endpoint.addFavourite()`

`engine` - what to use to do the request. Currently only `$` and `jQuery` are supported. `$` is the default. The engine must be globally exposed to the loader.
