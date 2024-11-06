FROM nginx:alpine 
COPY nginx.conf /etc/nginx/external.conf
EXPOSE 70
CMD ["nginx", "-c", "external.conf", "-g", "daemon off;"]