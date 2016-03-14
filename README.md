# kea-ruby-loader

This is an experimental module. Do not use with anything serious.

Given a ruby file like this:

```ruby
# at /app/bundles/search/components/result/reputation.rb
class Bundles::Search::Components::Result::Reputation < ApplicationController
  include Kea::Controller

  def reputation(id)
    @user = User.find(id)

    render json: {
      id: @user.id,
      name: @user.full_name,
      reputation: @user.reputation
    }
  end
end
```

Create an object like this:

```js
// at /app/bundles/search/components/result/reputation.js
import endpoint from './reputation.rb'

endpoint.reputation(this.props.id).then((response) => {
  console.log(response.name)
})
```
