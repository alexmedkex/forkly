export enum EmailType {
  Task = 'Task',
  Notification = 'Notification'
}

interface IEmailParams {
  link: string
  linkTitle: string
  type: EmailType
}

const resolveColor = (type: EmailType) => {
  return type === EmailType.Task ? '#5700b5' : '#009ea8'
}

const resolveName = (type: EmailType) => {
  return type === EmailType.Task ? 'Task' : 'Info'
}

export const buildEmailTemplate = ({ link, linkTitle, type }: IEmailParams): string => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Komgo ${resolveName(type)} Email</title>
    <style>
      /* Reset */

      img {
        border: none;
        -ms-interpolation-mode: bicubic;
        max-width: 100%;
      }

      body {
        background-color: #f6f6f6;
        font-family: sans-serif;
        -webkit-font-smoothing: antialiased;
        font-size: 14px;
        line-height: 1.4;
        margin: 0;
        padding: 0;
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
      }

      table {
        border-collapse: separate;
        border-spacing: 0;
        mso-table-lspace: 0;
        mso-table-rspace: 0;
        width: 100%;
      }
      table td {
        font-family: sans-serif;
        font-size: 14px;
        vertical-align: top;
      }

      /* -------------------------------------
      BODY & CONTAINER
  ------------------------------------- */

      .body {
        background-color: #f6f6f6;
        width: 100%;
      }

      .container {
        display: block;
        margin: 0 auto !important;
        /* makes it centered */
        max-width: 900px;
        padding: 10px;
        width: 100%;
      }

      .content {
        box-sizing: border-box;
        display: block;
        margin: 0 auto;
        max-width: 900px;
        padding: 10px;
      }

      /* -------------------------------------
      HEADER, FOOTER, MAIN
  ------------------------------------- */
      .main {
        border-radius: 3px;
        width: 100%;
      }

      .task {
        border-radius: 10px;
        background: ${resolveColor(type)};
        color: white;
        font-size: 9px;
        padding: 5px 10px 5px 10px;
        text-align: center;
        font-weight: bold;
      }

      .taskTitle {
        margin-left: 10px;
      }

      .logo {
        float: right;
        height: 35px;
      }

      .wrapper {
        box-sizing: border-box;
        padding: 0 20px 0 20px;
        width: 100%;
      }

      .content-block {
        position: relative;
        padding: 10px 0 10px 0;
      }

      .content-block_border {
        border-bottom: 1px solid #d5dfe9;
      }

      .footer {
        clear: both;
        margin-top: 10px;
        width: 100%;
        padding: 10px 20px 10px 20px;
      }
      .footer td,
      .footer p,
      .footer span,
      .footer a {
        color: #647b91;
        font-size: 12px;
      }

      /* -------------------------------------
      TYPOGRAPHY
  ------------------------------------- */
      h1,
      h2,
      h3,
      h4 {
        color: #000000;
        font-family: sans-serif;
        font-weight: 400;
        line-height: 1.4;
        margin: 0;
        margin-bottom: 10px;
      }

      h1 {
        font-size: 35px;
        font-weight: 300;
        text-transform: capitalize;
      }

      p,
      ul,
      ol {
        font-family: sans-serif;
        font-size: 14px;
        font-weight: normal;
        margin: 0;
        margin-bottom: 15px;
      }
      p li,
      ul li,
      ol li {
        list-style-position: inside;
        margin-left: 5px;
      }

      a {
        color: #3498db;
        text-decoration: underline;
      }

      .preheader {
        color: transparent;
        display: none;
        height: 0;
        max-height: 0;
        max-width: 0;
        opacity: 0;
        overflow: hidden;
        mso-hide: all;
        visibility: hidden;
        width: 0;
      }

      .box {
        box-sizing: border-box;
        background: white;
        border: 1px solid #d5dfe9;
        border-radius: 5px;
        padding: 20px;
      }

      /* -------------------------------------
      RESPONSIVE AND MOBILE FRIENDLY STYLES
  ------------------------------------- */
      @media only screen and (max-width: 620px) {
        .logo {
          margin: 10px 0 0 0;
          position: initial;
          display: block;
        }
        table[class='body'] h1 {
          font-size: 28px !important;
          margin-bottom: 10px !important;
        }
        table[class='body'] p,
        table[class='body'] ul,
        table[class='body'] ol,
        table[class='body'] td,
        table[class='body'] span,
        table[class='body'] a {
          font-size: 16px !important;
        }
        table[class='body'] .wrapper,
        table[class='body'] .article {
          padding: 10px !important;
        }
        table[class='body'] .content {
          padding: 0 !important;
        }
        table[class='body'] .container {
          padding: 0 !important;
          width: 100% !important;
        }
        table[class='body'] .main {
          border-left-width: 0 !important;
          border-radius: 0 !important;
          border-right-width: 0 !important;
        }
        table[class='body'] .btn table {
          width: 100% !important;
        }
        table[class='body'] .btn a {
          width: 100% !important;
        }
        table[class='body'] .img-responsive {
          height: auto !important;
          max-width: 100% !important;
          width: auto !important;
        }
      }
    </style>
  </head>
  <body class="">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
      <tr>
        <td>&nbsp;</td>
        <td class="container">
          <div class="content">
            <!-- START CENTERED WHITE CONTAINER  -->
            <table role="presentation" class="main">
              <!--   START MAIN CONTENT AREA -->
              <tr>
                <td class="wrapper">
                  <h3>You have a new notification from komgo</h3>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td class="box">
                        <span class="task">${resolveName(type).toUpperCase()}</span>
                        <span class="taskTitle"><a href="${link}">${linkTitle}</a></span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- END MAIN CONTENT AREA -->
            </table>

            <!-- END CENTERED WHITE CONTAINER -->

            <!-- START FOOTER -->
            <div class="footer wrapper">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="content-block content-block_border">
                    <span>Komgo, rue Adrien-Lachenal 20, 1207 Geneva, Switzerland</span>
                  </td>
                </tr>
                <tr>
                  <td class="content-block">
                    <img
                      alt="komgo logo"
                      class="logo"
                      src="https://consensys.gitlab.io/client/uk/KomGo/image-store/komgo-logo.png"
                    />
                    <span>
                      You have received this email because you are subscribed to notifications.
                      <br />Change what komgo sends you by updating your account preferences</span
                    >
                  </td>
                </tr>
              </table>
            </div>
            <!-- END FOOTER -->
          </div>
        </td>
        <td>&nbsp;</td>
      </tr>
    </table>
  </body>
</html>
`
}
