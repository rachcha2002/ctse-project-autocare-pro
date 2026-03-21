FROM nginx:alpine
# Copy the template file so Nginx can automatically substitute environment variables at runtime
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
