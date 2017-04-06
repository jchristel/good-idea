---
layout: page
title: About
permalink: /about/
---

<div class="about_Social">
  <ul class="social-icons">
    <li>
      <a href="{% if site.atom_feed.path %}{{ site.atom_feed.path }}{% else %}{{ '/feed.xml' | absolute_url }}{% endif %}"><i class="fa fa-fw fa-rss-square" aria-hidden="true"></i> {{ site.data.ui-text[site.locale].feed_label | default: "Feed" }}</a>
    </li>
    <li>
      <a href = "https://twitter.com/{{ site.twitter_username }}">
        <i class="fa fa-twitter"></i> Twitter
      </a>
    </li>
    <li>
      <a href = "https://linkedin.com/in/{{ site.linkedin_username }}">
        <i class="fa fa-linkedin"></i> LinkedIn
      </a>
    </li>
  </ul>
</div>

This is me having fun.
