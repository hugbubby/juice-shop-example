/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, type OnInit } from '@angular/core'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { ConfigurationService } from '../Services/configuration.service'
import { FeedbackService } from '../Services/feedback.service'
import { type IImage } from 'ng-simple-slideshow'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faFacebook, faReddit, faSlack, faTwitter } from '@fortawesome/free-brands-svg-icons'
import { faNewspaper, faStar } from '@fortawesome/free-regular-svg-icons'
import { faStar as fasStar, faPalette } from '@fortawesome/free-solid-svg-icons'

library.add(faFacebook, faTwitter, faSlack, faReddit, faNewspaper, faStar, fasStar, faPalette)

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  public twitterUrl?: string
  public facebookUrl?: string
  public slackUrl?: string
  public redditUrl?: string
  public pressKitUrl?: string
  public nftUrl?: string
  public slideshowDataSource: IImage[] = []

  private readonly images = [
    'assets/public/images/carousel/1.jpg',
    'assets/public/images/carousel/2.jpg',
    'assets/public/images/carousel/3.jpg',
    'assets/public/images/carousel/4.jpg',
    'assets/public/images/carousel/5.png',
    'assets/public/images/carousel/6.jpg',
    'assets/public/images/carousel/7.jpg'
  ]

  private readonly stars = [
    null,
    '<i class="fas fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i>',
    '<i class="fas fa-star"></i><i class="fas fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i>',
    '<i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i>',
    '<i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="far fa-star"></i>',
    '<i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>'
  ]

  constructor (private readonly configurationService: ConfigurationService, private readonly feedbackService: FeedbackService, private readonly sanitizer: DomSanitizer) {}

  ngOnInit () {
    this.populateSlideshowFromFeedbacks()
    this.configurationService.getApplicationConfiguration().subscribe((config) => {
      if (config?.application?.social) {
        if (config.application.social.twitterUrl) {
          this.twitterUrl = config.application.social.twitterUrl
        }
        if (config.application.social.facebookUrl) {
          this.facebookUrl = config.application.social.facebookUrl
        }
        if (config.application.social.slackUrl) {
          this.slackUrl = config.application.social.slackUrl
        }
        if (config.application.social.redditUrl) {
          this.redditUrl = config.application.social.redditUrl
        }
        if (config.application.social.pressKitUrl) {
          this.pressKitUrl = config.application.social.pressKitUrl
        }
        if (config.application.social.nftUrl) {
          this.nftUrl = config.application.social.nftUrl
        }
      }
    }, (err) => { console.log(err) })
  }

  populateSlideshowFromFeedbacks () {
    this.feedbackService.find().subscribe((feedbacks) => {
      for (let i = 0; i < feedbacks.length; i++) {
        const sanitizedComment = this.sanitizeComment(feedbacks[i].comment, feedbacks[i].rating);
        this.slideshowDataSource.push({ url: this.images[i % this.images.length], caption: sanitizedComment })
      }
    }, (err) => {
      console.log(err)
    })
  }

  private sanitizeComment(comment: string, rating: number): SafeHtml {
    const sanitizedComment = this.sanitizer.sanitize(1, comment) || '';
    const stars = this.stars[rating] || '';
    return this.sanitizer.bypassSecurityTrustHtml(`<span style="width: 90%; display:block;">${sanitizedComment}<br/> (${stars})</span>`);
  }
}
